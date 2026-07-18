import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify Meta's `X-Hub-Signature-256` header against the exact webhook body.
 *
 * This deliberately accepts bytes as well as a string: production passes the
 * bytes read from the request, which avoids changing the payload before HMAC
 * verification. It is kept pure so it is safe to exercise independently.
 */
export function verifyWebhookSignature(
  rawBody: Uint8Array | ArrayBuffer | string,
  header: string | null | undefined,
  secret: string,
): boolean {
  if (secret.length === 0 || header === null || header === undefined) {
    return false;
  }

  // Meta sends a lowercase, 64-character SHA-256 digest. Do not trim or
  // otherwise normalise this value: malformed signatures must be rejected.
  if (!/^sha256=[a-f0-9]{64}$/.test(header)) {
    return false;
  }

  try {
    const expected = createHmac("sha256", secret)
      .update(asBytes(rawBody))
      .digest();
    const supplied = hexToBytes(header.slice("sha256=".length));

    if (supplied === null || expected.byteLength !== supplied.byteLength) {
      return false;
    }

    return timingSafeEqual(expected, supplied);
  } catch {
    // Signature verification is a security boundary. A malformed input or an
    // unavailable crypto primitive is never a reason to accept a request.
    return false;
  }
}

/** Short name used by the webhook boundary in the build plan. */
export const verify = verifyWebhookSignature;

function asBytes(value: Uint8Array | ArrayBuffer | string): Uint8Array {
  if (typeof value === "string") {
    return new TextEncoder().encode(value);
  }

  return value instanceof ArrayBuffer ? new Uint8Array(value) : value;
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length !== 64) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16);

    if (!Number.isInteger(byte)) {
      return null;
    }

    bytes[index / 2] = byte;
  }

  return bytes;
}
