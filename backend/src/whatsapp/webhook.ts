import { Hono } from "hono";

import {
  parseWebhookPayload,
  type InboundMessage,
} from "./parse";
import { verifyWebhookSignature } from "./signature";

/** Webhook envelopes are tiny; cap unauthenticated bodies before buffering. */
export const MAX_WEBHOOK_BODY_BYTES = 1 * 1024 * 1024;

export interface WebhookLogger {
  warn(message: string): void;
}

export type InboundMessageHandler = (
  message: InboundMessage,
) => Promise<void> | void;

export type WabaIdHandler = (wabaId: string) => Promise<void> | void;

export interface MessageDeduper {
  /** Returns true exactly once for a message id until it is evicted. */
  addIfAbsent(messageId: string): boolean;
}

export interface WhatsAppWebhookOptions {
  verifyToken: string;
  appSecret: string;
  /** The seller-flow entry point; one failure is isolated from its siblings. */
  onMessage: InboundMessageHandler;
  /** Optional deploy-time hook for the WABA id in entry[].id. */
  onWabaId?: WabaIdHandler;
  deduper?: MessageDeduper;
  maxSeenMessageIds?: number;
  logger?: WebhookLogger;
}

interface VerifiedPayloadProcessorOptions {
  onMessage: InboundMessageHandler;
  onWabaId?: WabaIdHandler;
  deduper: MessageDeduper;
  seenWabaIds: Set<string>;
  logger?: WebhookLogger;
}

/**
 * A bounded process-local deduper for Meta retry deliveries. It is deliberately
 * tiny and stateless: the database remains the source of truth for products,
 * while this only prevents a retry from causing a second bot turn.
 */
export class InMemoryMessageDeduper implements MessageDeduper {
  private readonly seen = new Set<string>();
  private readonly insertionOrder: string[] = [];

  public constructor(private readonly maximumSize = 10_000) {}

  public addIfAbsent(messageId: string): boolean {
    if (this.seen.has(messageId)) {
      return false;
    }

    this.seen.add(messageId);
    this.insertionOrder.push(messageId);

    while (this.insertionOrder.length > this.safeMaximumSize()) {
      const oldest = this.insertionOrder.shift();
      if (oldest !== undefined) {
        this.seen.delete(oldest);
      }
    }

    return true;
  }

  private safeMaximumSize(): number {
    return Number.isSafeInteger(this.maximumSize) && this.maximumSize > 0
      ? this.maximumSize
      : 10_000;
  }
}

/**
 * Build the Hono router mounted at `/`. It owns the exact public paths:
 * `/webhook/whatsapp` for both Meta verification and inbound deliveries.
 */
export function createWhatsAppWebhookRouter(options: WhatsAppWebhookOptions): Hono {
  const router = new Hono();
  const deduper =
    options.deduper ?? new InMemoryMessageDeduper(options.maxSeenMessageIds);
  const seenWabaIds = new Set<string>();

  router.get("/webhook/whatsapp", (context) => {
    const mode = context.req.query("hub.mode");
    const verifyToken = context.req.query("hub.verify_token");
    const challenge = context.req.query("hub.challenge");

    if (
      mode !== "subscribe" ||
      verifyToken !== options.verifyToken ||
      challenge === undefined
    ) {
      return context.text("Forbidden", 403);
    }

    return context.text(challenge, 200);
  });

  router.post("/webhook/whatsapp", async (context) => {
    let rawBody: Uint8Array;

    try {
      // Request bytes are captured before JSON parsing; any transformation here
      // would make verification vulnerable or simply reject real deliveries.
      const body = await readRawBodyWithinLimit(
        context.req.raw,
        MAX_WEBHOOK_BODY_BYTES,
      );
      if (body === null) {
        log(options.logger, "rejected oversized or unreadable webhook body");
        return context.text("Payload too large", 413);
      }
      rawBody = body;
    } catch {
      log(options.logger, "could not read webhook body");
      return context.text("Forbidden", 403);
    }

    const signature = context.req.header("x-hub-signature-256");
    if (!verifyWebhookSignature(rawBody, signature, options.appSecret)) {
      return context.text("Forbidden", 403);
    }

    // Return from the Hono handler before any parsing or delivery work. A
    // microtask could run before Bun gets the resolved Response, so use the
    // next timer turn to uphold the strict ACK-before-work webhook contract.
    setTimeout(() => {
      void processVerifiedWebhookPayload(rawBody, {
        onMessage: options.onMessage,
        onWabaId: options.onWabaId,
        deduper,
        seenWabaIds,
        logger: options.logger,
      }).catch((error: unknown) => {
        log(options.logger, `unexpected asynchronous processing failure (${failureReason(error)})`);
      });
    }, 0);

    return context.text("OK", 200);
  });

  return router;
}

/** Alias convenient for a server that names its route factory generically. */
export const createWebhookRouter = createWhatsAppWebhookRouter;

/**
 * Process an already signature-verified raw payload. Exported for focused
 * checks; callers must not invoke it for an unauthenticated request.
 */
export async function processVerifiedWebhookPayload(
  rawBody: Uint8Array,
  options: VerifiedPayloadProcessorOptions,
): Promise<void> {
  let payload: unknown;

  try {
    payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(rawBody));
  } catch {
    log(options.logger, "ignored malformed JSON webhook body");
    return;
  }

  const parsed = parseWebhookPayload(payload);

  for (const wabaId of parsed.wabaIds) {
    if (options.seenWabaIds.has(wabaId)) {
      continue;
    }

    options.seenWabaIds.add(wabaId);

    if (options.onWabaId === undefined) {
      continue;
    }

    try {
      await options.onWabaId(wabaId);
    } catch (error: unknown) {
      log(options.logger, `WABA id handler failed (${failureReason(error)})`);
    }
  }

  for (const message of parsed.messages) {
    if (!options.deduper.addIfAbsent(message.id)) {
      continue;
    }

    try {
      await options.onMessage(message);
    } catch (error: unknown) {
      // One malformed attachment or failed agent turn must not stop a later
      // sibling message in the same Meta envelope.
      log(options.logger, `message handler failed (${failureReason(error)})`);
    }
  }
}

function failureReason(error: unknown): string {
  return error instanceof Error && error.name.length > 0 ? error.name : "unknown";
}

function log(logger: WebhookLogger | undefined, message: string): void {
  logger?.warn(`WhatsApp webhook: ${message}`);
}

/**
 * Collect raw bytes without allowing an unauthenticated request to allocate
 * unbounded memory. The returned buffer is byte-for-byte what HMAC verifies.
 */
async function readRawBodyWithinLimit(
  request: Request,
  maximumBytes: number,
): Promise<Uint8Array | null> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null && /^\d+$/.test(declaredLength)) {
    const size = Number(declaredLength);
    if (!Number.isSafeInteger(size) || size > maximumBytes) return null;
  }

  const body = request.body;
  if (body === null) return new Uint8Array();

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value === undefined) return null;
      const chunk = value;
      totalBytes += chunk.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(chunk);
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }

  const rawBody = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    rawBody.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return rawBody;
}
