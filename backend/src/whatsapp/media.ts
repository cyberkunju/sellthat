/** A conservative cap for inbound photos and voice notes retained in memory. */
export const DEFAULT_MAX_INBOUND_MEDIA_BYTES = 16 * 1024 * 1024;
export const EXTERNAL_TIMEOUT_MS = 8_000;

export interface DownloadedInboundMedia {
  bytes: Uint8Array;
  mimeType: string;
  /** The size Meta reported, when it supplied one. */
  declaredSize: number | null;
}

export interface FailureLogger {
  warn(message: string): void;
}

export interface MediaDownloadOptions {
  /** Meta system-user token. Kept injectable so this module never reads env. */
  token: string;
  /** For example: https://graph.facebook.com/v23.0 */
  graphBaseUrl: string;
  maxBytes?: number;
  fetch?: typeof globalThis.fetch;
  logger?: FailureLogger;
}

/** Matches the DB image writer: persist bytes and their authenticated MIME type. */
export type StoreInboundImage = (
  bytes: Uint8Array,
  mimeType: string,
) => Promise<string | null>;

/**
 * Download a Meta media object safely using the required two-hop flow.
 *
 * Every network or decoding failure returns null; callers can simply ask the
 * seller to resend the attachment without exposing an implementation error.
 */
export async function downloadInboundMedia(
  mediaId: string,
  options: MediaDownloadOptions,
): Promise<DownloadedInboundMedia | null> {
  const id = mediaId.trim();
  const maxBytes = validMaxBytes(options.maxBytes);

  if (
    id.length === 0 ||
    options.token.length === 0 ||
    options.graphBaseUrl.trim().length === 0
  ) {
    logFailure(options.logger, "invalid media download configuration");
    return null;
  }

  const fetcher = options.fetch ?? globalThis.fetch;
  const authorization = { Authorization: `Bearer ${options.token}` };

  try {
    // Hop 1: retrieve the expiring binary URL and Meta's declared metadata.
    const metadataResponse = await fetcher(graphMediaUrl(options.graphBaseUrl, id), {
      headers: authorization,
      signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
    });

    if (!metadataResponse.ok) {
      logFailure(options.logger, `media metadata request failed (${metadataResponse.status})`);
      return null;
    }

    const metadata = asRecord(await metadataResponse.json());
    const binaryUrl = metadata === null ? null : httpsUrlOrNull(metadata.url);
    const declaredSize = metadata === null ? null : byteCountOrNull(metadata.file_size);

    if (binaryUrl === null) {
      logFailure(options.logger, "media metadata did not contain a valid url");
      return null;
    }

    if (declaredSize !== null && declaredSize > maxBytes) {
      logFailure(options.logger, "media exceeds the configured size limit");
      return null;
    }

    // Hop 2: fetch the actual bytes. Check Content-Length before materialising
    // the body as an additional early guard when Graph omitted file_size.
    const binaryResponse = await fetcher(binaryUrl, {
      headers: authorization,
      signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
    });

    if (!binaryResponse.ok) {
      logFailure(options.logger, `media binary request failed (${binaryResponse.status})`);
      return null;
    }

    const contentLength = byteCountOrNull(binaryResponse.headers.get("content-length"));
    if (contentLength !== null && contentLength > maxBytes) {
      logFailure(options.logger, "media content-length exceeds the configured size limit");
      return null;
    }

    const bytes = await readResponseBytesWithinLimit(binaryResponse, maxBytes);
    if (bytes === null) {
      logFailure(options.logger, "media body exceeds the configured size limit or could not be read");
      return null;
    }

    return {
      bytes,
      mimeType:
        nonEmptyString(metadata?.mime_type) ??
        contentTypeOrNull(binaryResponse.headers.get("content-type")) ??
        "application/octet-stream",
      declaredSize,
    };
  } catch (error: unknown) {
    logFailure(options.logger, `media download failed (${failureReason(error)})`);
    return null;
  }
}

/** The shorter name used in some call sites. */
export const downloadMedia = downloadInboundMedia;

/**
 * A small bridge for the seller flow: only image media is offered to the DB
 * persistence callback. Audio callers should use downloadInboundMedia and
 * pass the bytes directly to Sarvam STT.
 */
export async function downloadAndStoreInboundImage(
  mediaId: string,
  options: MediaDownloadOptions,
  storeImage: StoreInboundImage,
): Promise<string | null> {
  const media = await downloadInboundMedia(mediaId, options);

  if (media === null || !media.mimeType.toLowerCase().startsWith("image/")) {
    return null;
  }

  try {
    return await storeImage(media.bytes, media.mimeType);
  } catch (error: unknown) {
    logFailure(options.logger, `image persistence failed (${failureReason(error)})`);
    return null;
  }
}

function graphMediaUrl(graphBaseUrl: string, mediaId: string): string {
  return `${graphBaseUrl.replace(/\/+$/, "")}/${encodeURIComponent(mediaId)}`;
}

function validMaxBytes(value: number | undefined): number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0
    ? value
    : DEFAULT_MAX_INBOUND_MEDIA_BYTES;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function httpsUrlOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function byteCountOrNull(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function contentTypeOrNull(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const mimeType = value.split(";", 1)[0]?.trim();
  return mimeType !== undefined && mimeType.length > 0 ? mimeType : null;
}

function failureReason(error: unknown): string {
  return error instanceof Error && error.name.length > 0 ? error.name : "unknown";
}

function logFailure(logger: FailureLogger | undefined, message: string): void {
  logger?.warn(`WhatsApp media: ${message}`);
}

/** Stream and count the binary response so a lying/missing Content-Length
 * cannot force a full oversized allocation before the size cap applies. */
async function readResponseBytesWithinLimit(
  response: Response,
  maximumBytes: number,
): Promise<Uint8Array | null> {
  if (response.body === null) return null;

  const reader = response.body.getReader();
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

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
