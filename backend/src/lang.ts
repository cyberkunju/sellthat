import { config } from "./config";
import { LANGUAGE_CODES, type LanguageCode } from "./types";

/** Canonical application language codes. Sarvam uses `od-IN` only at its boundary. */
export type { LanguageCode } from "./types";

export type SarvamLanguageCode = Exclude<LanguageCode, "or-IN"> | "od-IN";

export interface DetectLanguageOptions {
  /** Preserve the chosen language for romanized (Latin-script) messages. */
  sessionLanguage?: LanguageCode;
  /** Set false when a caller needs the offline script result without text LID. */
  resolveAmbiguity?: boolean;
}

export interface Transcription {
  text: string;
  language: LanguageCode;
}

export interface Speech {
  mp3Bytes: Uint8Array;
}

export const DEFAULT_LANGUAGE: LanguageCode = "en-IN";
export const SARVAM_TIMEOUT_MS = 8_000;

const SARVAM_BASE_URL = "https://api.sarvam.ai";
const languageCodes = new Set<string>(LANGUAGE_CODES);
const normalizedLanguageCodes = new Map<string, LanguageCode>([
  ...LANGUAGE_CODES.map((language) => [language.toLowerCase(), language] as const),
  ["od-in", "or-IN"],
]);

const SCRIPT_PATTERNS: ReadonlyArray<readonly [LanguageCode, RegExp]> = [
  ["ta-IN", /[\u0B80-\u0BFF]/u],
  ["te-IN", /[\u0C00-\u0C7F]/u],
  ["kn-IN", /[\u0C80-\u0CFF]/u],
  ["ml-IN", /[\u0D00-\u0D7F]/u],
  ["bn-IN", /[\u0980-\u09FF]/u],
  ["gu-IN", /[\u0A80-\u0AFF]/u],
  ["pa-IN", /[\u0A00-\u0A7F]/u],
  ["or-IN", /[\u0B00-\u0B7F]/u],
  // Hindi is the deterministic default; text-lid resolves Hindi versus Marathi.
  ["hi-IN", /[\u0900-\u097F]/u],
];
const LATIN_PATTERN = /\p{Script=Latin}/u;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function logSarvamFailure(path: string, reason: string): void {
  // Deliberately omit request bodies and headers: they can contain user content or credentials.
  console.warn(`[lang] Sarvam ${path} failed: ${reason}`);
}

async function postSarvam(
  path: string,
  body: BodyInit,
  contentType?: string,
): Promise<Record<string, unknown> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SARVAM_TIMEOUT_MS);

  try {
    const response = await fetch(`${SARVAM_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "api-subscription-key": config.sarvamApiKey,
        ...(contentType ? { "content-type": contentType } : {}),
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      logSarvamFailure(path, `HTTP ${response.status}`);
      return null;
    }

    return asRecord(await response.json());
  } catch {
    logSarvamFailure(path, "request error");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function postSarvamJson(
  path: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  try {
    return await postSarvam(path, JSON.stringify(body), "application/json");
  } catch {
    logSarvamFailure(path, "request error");
    return null;
  }
}

function countMatches(text: string, pattern: RegExp): number {
  let count = 0;
  for (const character of text) {
    if (pattern.test(character)) {
      count += 1;
    }
  }
  return count;
}

function hasIndianScript(text: string): boolean {
  return SCRIPT_PATTERNS.some(([, pattern]) => pattern.test(text));
}

function hasMixedScripts(text: string): boolean {
  const presentScripts = SCRIPT_PATTERNS.filter(([, pattern]) => pattern.test(text)).length;
  return presentScripts + (LATIN_PATTERN.test(text) ? 1 : 0) > 1;
}

function truncateCharacters(text: string, maxCharacters: number): string {
  return Array.from(text).slice(0, Math.max(1, maxCharacters)).join("");
}

function audioFilename(mime: string): string {
  if (mime.includes("ogg")) return "voice.ogg";
  if (mime.includes("webm")) return "voice.webm";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "voice.mp3";
  if (mime.includes("wav")) return "voice.wav";
  return "voice.bin";
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const comma = value.startsWith("data:") ? value.indexOf(",") : -1;
    const encoded = comma >= 0 ? value.slice(comma + 1) : value;
    const binary = atob(encoded);
    if (binary.length === 0) return null;

    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function identifyLanguage(text: string): Promise<LanguageCode | null> {
  const response = await postSarvamJson("/text-lid", { input: text });
  return normalizeLanguageCode(response?.language_code);
}

/** Returns true only for one of SellThat's eleven canonical application codes. */
export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === "string" && languageCodes.has(value);
}

/** Normalizes Sarvam's `od-IN` response back to the app's canonical `or-IN`. */
export function normalizeLanguageCode(value: unknown): LanguageCode | null {
  if (typeof value !== "string") return null;
  return normalizedLanguageCodes.get(value.trim().toLowerCase()) ?? null;
}

/** Maps the application's Odia code to Sarvam's required `od-IN` on outbound calls. */
export function toSarvamLanguageCode(language: LanguageCode): SarvamLanguageCode {
  return language === "or-IN" ? "od-IN" : language;
}

/**
 * Detects a supported language without network I/O. Devanagari deliberately defaults to Hindi;
 * use detectLanguage() when Hindi/Marathi or Romanized text should be resolved with text-lid.
 */
export function detectScriptLanguage(text: string): LanguageCode | null {
  let detected: LanguageCode | null = null;
  let highestCount = 0;

  // A non-Latin Indian script always wins over incidental English product names or numerals.
  for (const [language, pattern] of SCRIPT_PATTERNS) {
    const count = countMatches(text, pattern);
    if (count > highestCount) {
      detected = language;
      highestCount = count;
    }
  }

  if (detected) return detected;
  return LATIN_PATTERN.test(text) ? "en-IN" : null;
}

/**
 * Script-first language detection for the eleven supported languages. Latin text keeps the
 * seller's chosen language (or the default on first contact) and is never sent to text-lid,
 * because short English strings such as product names get misread as unrelated languages.
 * Only Devanagari is sent to Sarvam text-lid, and only to disambiguate Hindi from Marathi.
 * Deliberate language switches come from the picker and from explicitLanguageFromText.
 */
export async function detectLanguage(
  text: string,
  options: DetectLanguageOptions = {},
): Promise<LanguageCode> {
  try {
    const scriptLanguage = detectScriptLanguage(text);
    if (!scriptLanguage) return options.sessionLanguage ?? DEFAULT_LANGUAGE;

    // Latin/romanized text is inherently ambiguous, and Sarvam text-lid often
    // misreads a short English string (a product name like "Omen laptop") as an
    // unrelated Indian language. Never let it override the seller's chosen
    // language: keep the saved one, or default on first contact. Explicit
    // switches come from the language picker and from explicitLanguageFromText,
    // which matches spelled-out language names ("Tamil", "Bangla", ...).
    if (scriptLanguage === "en-IN") {
      return options.sessionLanguage ?? DEFAULT_LANGUAGE;
    }

    const resolveAmbiguity = options.resolveAmbiguity ?? true;
    const isAmbiguous = scriptLanguage === "hi-IN" || !hasIndianScript(text);
    if (!resolveAmbiguity || !isAmbiguous) return scriptLanguage;

    return (await identifyLanguage(text)) ?? options.sessionLanguage ?? scriptLanguage;
  } catch {
    return options.sessionLanguage ?? DEFAULT_LANGUAGE;
  }
}

/**
 * Transcribes a WhatsApp audio payload directly (OGG/Opus needs no transcoding). Sarvam must
 * auto-detect every voice turn, so language_code is intentionally always `unknown`.
 */
export async function transcribe(
  audioBytes: Uint8Array,
  mime: string,
  hint?: LanguageCode,
): Promise<Transcription | null> {
  if (audioBytes.byteLength === 0) return null;

  try {
    const safeMime = mime.trim() || "application/octet-stream";
    const form = new FormData();
    form.set("model", config.sarvamSttModel);
    form.set("language_code", "unknown");
    // Copy into an ArrayBuffer-backed view so Bun/TypeScript can send it as a Blob reliably.
    const blobBytes = Uint8Array.from(audioBytes);
    form.set("file", new Blob([blobBytes.buffer], { type: safeMime }), audioFilename(safeMime));

    const response = await postSarvam("/speech-to-text", form);
    const text = nonEmptyString(response?.transcript)?.trim();
    if (!text) return null;

    return {
      text,
      language: normalizeLanguageCode(response?.language_code) ?? hint ?? DEFAULT_LANGUAGE,
    };
  } catch {
    logSarvamFailure("/speech-to-text", "request error");
    return null;
  }
}

/**
 * Uses Sarvam translation only as a reply-language safety net. Numbers stay in international
 * notation so whole-rupee prices and quantities survive a translation round trip.
 */
export async function translate(
  text: string,
  toLanguage: LanguageCode,
  fromLanguage?: LanguageCode,
): Promise<string | null> {
  if (text.trim().length === 0) return text;

  try {
    const sourceLanguage = fromLanguage ?? (await detectLanguage(text));
    if (sourceLanguage === toLanguage) return text;

    const response = await postSarvamJson("/translate", {
      input: text,
      source_language_code: toSarvamLanguageCode(sourceLanguage),
      target_language_code: toSarvamLanguageCode(toLanguage),
      numerals_format: "international",
      mode: hasMixedScripts(text) ? "code-mixed" : "formal",
    });

    return nonEmptyString(response?.translated_text)?.trim() ?? null;
  } catch {
    logSarvamFailure("/translate", "request error");
    return null;
  }
}

/** Creates WhatsApp-compatible MP3 bytes with Sarvam Bulbul. */
export async function speak(text: string, language: LanguageCode): Promise<Speech | null> {
  const cappedText = truncateCharacters(text.trim(), config.sarvamTtsMaxChars).trim();
  if (!cappedText) return null;

  try {
    const response = await postSarvamJson("/text-to-speech", {
      text: cappedText,
      target_language_code: toSarvamLanguageCode(language),
      speaker: config.sarvamTtsSpeaker,
      model: config.sarvamTtsModel,
      output_audio_codec: "mp3",
    });
    const audios = response?.audios;
    const firstAudio = Array.isArray(audios) ? audios[0] : null;
    if (typeof firstAudio !== "string") return null;

    const mp3Bytes = decodeBase64(firstAudio);
    return mp3Bytes ? { mp3Bytes } : null;
  } catch {
    logSarvamFailure("/text-to-speech", "request error");
    return null;
  }
}
