import type { LanguageCode } from "../types";

/** Meta calls must fail safe and must not hold a webhook worker indefinitely. */
export const WHATSAPP_REQUEST_TIMEOUT_MS = 8_000;
export const MAX_TEXT_CHARACTERS = 4_096;
export const MAX_BUTTON_BODY_CHARACTERS = 1_024;
export const MAX_BUTTON_TITLE_CHARACTERS = 20;

export const FIXED_BUTTON_IDS = [
  "lang_en-IN",
  "lang_hi-IN",
  "lang_more",
  "role_seller",
  "role_buyer",
  "verify_yes",
  "confirm_yes",
  "confirm_edit",
] as const;

export type FixedButtonId = (typeof FIXED_BUTTON_IDS)[number];

export interface ReplyButton {
  /** Must be one of the frozen ids above when used by the seller flow. */
  id: string;
  title: string;
}

export interface WhatsAppSendResult {
  ok: boolean;
  messageId?: string;
  errorCode?: number | string;
}

export interface VoiceSynthesisResult {
  mp3Bytes: Uint8Array;
}

export type Speak = (
  text: string,
  language: LanguageCode,
) => Promise<VoiceSynthesisResult | null>;

export interface SenderLogger {
  warn(message: string): void;
}

export interface WhatsAppSenderOptions {
  /** Meta system-user token. This module intentionally never reads env. */
  token: string;
  phoneNumberId: string;
  /** For example: https://graph.facebook.com/v23.0 */
  graphBaseUrl: string;
  /** Sarvam-backed TTS supplied by lang.ts. */
  speak?: Speak;
  fetch?: typeof globalThis.fetch;
  logger?: SenderLogger;
}

export interface ReplyResult {
  /** Text, or an interactive button message when buttons were supplied. */
  text: WhatsAppSendResult;
  /** Null means TTS was unavailable; the text response still went out. */
  voice: WhatsAppSendResult | null;
}

export interface WhatsAppSenderClient {
  sendText(to: string, body: string): Promise<WhatsAppSendResult>;
  sendButtons(
    to: string,
    message: { body: string; buttons: readonly ReplyButton[] },
  ): Promise<WhatsAppSendResult>;
  uploadMedia(bytes: Uint8Array, mime: string, filename: string): Promise<string | null>;
  sendVoiceNote(to: string, mp3Bytes: Uint8Array): Promise<WhatsAppSendResult>;
  markRead(messageId: string, typing?: boolean): Promise<void>;
  reply(
    to: string,
    text: string,
    language: LanguageCode,
    buttons?: readonly ReplyButton[],
  ): Promise<ReplyResult>;
}

/**
 * Create the sole outbound WhatsApp client. Keeping its dependencies injected
 * makes boot configuration explicit and keeps all token access in config.ts.
 */
export function createWhatsAppSender(options: WhatsAppSenderOptions): WhatsAppSender {
  return new WhatsAppSender(options);
}

export class WhatsAppSender implements WhatsAppSenderClient {
  private readonly fetcher: typeof globalThis.fetch;

  public constructor(private readonly options: WhatsAppSenderOptions) {
    this.fetcher = options.fetch ?? globalThis.fetch;
  }

  public async sendText(to: string, body: string): Promise<WhatsAppSendResult> {
    const recipient = validRecipient(to);
    const text = truncate(body, MAX_TEXT_CHARACTERS);

    if (recipient === null || text.length === 0) {
      return { ok: false, errorCode: "invalid_text_message" };
    }

    return this.postMessages({
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: text, preview_url: false },
    });
  }

  public async sendButtons(
    to: string,
    message: { body: string; buttons: readonly ReplyButton[] },
  ): Promise<WhatsAppSendResult> {
    const recipient = validRecipient(to);
    const body = truncate(message.body, MAX_BUTTON_BODY_CHARACTERS);
    const buttons = message.buttons.map((button) => ({
      id: button.id.trim(),
      title: button.title.trim(),
    }));

    if (recipient === null || body.length === 0 || !validButtons(buttons)) {
      return { ok: false, errorCode: "invalid_button_message" };
    }

    return this.postMessages({
      messaging_product: "whatsapp",
      to: recipient,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: buttons.map((button) => ({
            type: "reply" as const,
            reply: { id: button.id, title: button.title },
          })),
        },
      },
    });
  }

  public async uploadMedia(
    bytes: Uint8Array,
    mime: string,
    filename: string,
  ): Promise<string | null> {
    if (
      bytes.byteLength === 0 ||
      mime.trim().length === 0 ||
      filename.trim().length === 0 ||
      !this.hasValidConfiguration()
    ) {
      this.log("media upload skipped because its input was invalid");
      return null;
    }

    try {
      const form = new FormData();
      form.set("messaging_product", "whatsapp");
      form.set("type", mime);
      // Copy into a standard ArrayBuffer-backed view for the DOM Blob type
      // and Bun's multipart encoder.
      const blobBytes = Uint8Array.from(bytes);
      form.set("file", new Blob([blobBytes.buffer], { type: mime }), filename);

      const response = await this.fetcher(this.mediaEndpoint(), {
        method: "POST",
        headers: this.authorizationHeaders(),
        body: form,
        signal: AbortSignal.timeout(WHATSAPP_REQUEST_TIMEOUT_MS),
      });
      const payload = await safeJson(response);

      if (!response.ok) {
        this.log(`media upload failed (${errorCodeFrom(payload, response.status)})`);
        return null;
      }

      const id = nonEmptyString(asRecord(payload)?.id);
      if (id === null) {
        this.log("media upload returned no media id");
      }

      return id;
    } catch (error: unknown) {
      this.log(`media upload failed (${failureReason(error)})`);
      return null;
    }
  }

  public async sendVoiceNote(
    to: string,
    mp3Bytes: Uint8Array,
  ): Promise<WhatsAppSendResult> {
    const recipient = validRecipient(to);

    if (recipient === null || mp3Bytes.byteLength === 0) {
      return { ok: false, errorCode: "invalid_voice_note" };
    }

    const mediaId = await this.uploadMedia(mp3Bytes, "audio/mpeg", "reply.mp3");
    if (mediaId === null) {
      return { ok: false, errorCode: "media_upload_failed" };
    }

    return this.postMessages({
      messaging_product: "whatsapp",
      to: recipient,
      type: "audio",
      audio: { id: mediaId },
    });
  }

  /** Best effort only: delivery/read failure must never affect a seller turn. */
  public async markRead(messageId: string, typing = false): Promise<void> {
    const id = messageId.trim();
    if (id.length === 0) {
      return;
    }

    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: id,
    };

    if (typing) {
      payload.typing_indicator = { type: "text" };
    }

    await this.postMessages(payload);
  }

  /**
   * The mandatory outbound path: visual text first, then Sarvam's mp3 voice
   * note. Interactive buttons count as the visual text message when supplied.
   */
  public async reply(
    to: string,
    text: string,
    language: LanguageCode,
    buttons?: readonly ReplyButton[],
  ): Promise<ReplyResult> {
    let textResult: WhatsAppSendResult;

    try {
      if (buttons !== undefined && buttons.length > 0 && validButtons(buttons)) {
        textResult = await this.sendButtons(to, { body: text, buttons });
      } else {
        // Invalid optional buttons must not prevent the universal text reply.
        textResult = await this.sendText(to, text);
      }
    } catch (error: unknown) {
      this.log(`text reply failed (${failureReason(error)})`);
      textResult = { ok: false, errorCode: "send_failed" };
    }

    if (this.options.speak === undefined) {
      this.log("voice reply skipped because no speech provider was configured");
      return { text: textResult, voice: null };
    }

    try {
      const speech = await this.options.speak(truncate(text, MAX_TEXT_CHARACTERS), language);
      if (speech === null || speech.mp3Bytes.byteLength === 0) {
        this.log("voice reply synthesis was unavailable");
        return { text: textResult, voice: null };
      }

      // Awaiting this after the text send preserves the required send order.
      const voice = await this.sendVoiceNote(to, speech.mp3Bytes);
      return { text: textResult, voice };
    } catch (error: unknown) {
      // A provider implementation must not be able to surface an exception to
      // the webhook. Text is already sent at this point.
      this.log(`voice reply synthesis failed (${failureReason(error)})`);
      return { text: textResult, voice: null };
    }
  }

  private async postMessages(payload: Record<string, unknown>): Promise<WhatsAppSendResult> {
    if (!this.hasValidConfiguration()) {
      this.log("message send skipped because configuration was invalid");
      return { ok: false, errorCode: "invalid_configuration" };
    }

    try {
      const response = await this.fetcher(this.messagesEndpoint(), {
        method: "POST",
        headers: {
          ...this.authorizationHeaders(),
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(WHATSAPP_REQUEST_TIMEOUT_MS),
      });
      const responsePayload = await safeJson(response);

      if (!response.ok) {
        const errorCode = errorCodeFrom(responsePayload, response.status);
        this.log(`message send failed (${errorCode})`);
        return { ok: false, errorCode };
      }

      return { ok: true, messageId: messageIdFrom(responsePayload) ?? undefined };
    } catch (error: unknown) {
      this.log(`message send failed (${failureReason(error)})`);
      return { ok: false, errorCode: "network_error" };
    }
  }

  private hasValidConfiguration(): boolean {
    return (
      this.options.token.length > 0 &&
      this.options.phoneNumberId.trim().length > 0 &&
      this.options.graphBaseUrl.trim().length > 0
    );
  }

  private authorizationHeaders(): HeadersInit {
    return { Authorization: `Bearer ${this.options.token}` };
  }

  private messagesEndpoint(): string {
    return `${normalisedGraphBase(this.options.graphBaseUrl)}/${encodeURIComponent(
      this.options.phoneNumberId,
    )}/messages`;
  }

  private mediaEndpoint(): string {
    return `${normalisedGraphBase(this.options.graphBaseUrl)}/${encodeURIComponent(
      this.options.phoneNumberId,
    )}/media`;
  }

  private log(message: string): void {
    this.options.logger?.warn(`WhatsApp sender: ${message}`);
  }
}

function validRecipient(value: string): string | null {
  const recipient = value.trim();
  return recipient.length > 0 && recipient.length <= 64 ? recipient : null;
}

function validButtons(buttons: readonly ReplyButton[]): boolean {
  if (buttons.length === 0 || buttons.length > 3) {
    return false;
  }

  const ids = new Set<string>();

  return buttons.every((button) => {
    const id = button.id.trim();
    const title = button.title.trim();
    const valid =
      id.length > 0 &&
      id.length <= 256 &&
      title.length > 0 &&
      characterLength(title) <= MAX_BUTTON_TITLE_CHARACTERS &&
      !ids.has(id);

    if (valid) {
      ids.add(id);
    }

    return valid;
  });
}

function truncate(value: string, maximumCharacters: number): string {
  return Array.from(value).slice(0, maximumCharacters).join("");
}

function characterLength(value: string): number {
  return Array.from(value).length;
}

function normalisedGraphBase(value: string): string {
  return value.replace(/\/+$/, "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function messageIdFrom(value: unknown): string | null {
  const root = asRecord(value);
  const messages = root === null || !Array.isArray(root.messages) ? [] : root.messages;
  const first = asRecord(messages[0]);
  return first === null ? null : nonEmptyString(first.id);
}

function errorCodeFrom(value: unknown, fallback: number): number | string {
  const root = asRecord(value);
  const error = root === null ? null : asRecord(root.error);
  const code = error === null ? null : error.code;

  return typeof code === "number" || typeof code === "string" ? code : fallback;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function failureReason(error: unknown): string {
  return error instanceof Error && error.name.length > 0 ? error.name : "unknown";
}
