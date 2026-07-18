import type { PublicProduct } from "./types";

/**
 * A deliberately conservative resolver for a seller's own product titles.
 * It does not guess between similar titles: an uncertain spoken/text reference
 * must fall back to the tappable listing picker.
 */
export function resolveUniqueProductReference(
  products: readonly PublicProduct[],
  reference: string,
): PublicProduct | null {
  const normalizedReference = normalizeProductReference(reference);
  const referenceTokens = comparableTokens(normalizedReference);
  if (normalizedReference.length < 2 || referenceTokens.length === 0) return null;

  const scored = products
    .map((product) => ({ product, score: referenceScore(product.title, normalizedReference, referenceTokens) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);

  const first = scored[0];
  if (!first) return null;

  const second = scored[1];
  // A title that exactly equals the spoken reference is trustworthy unless two
  // of the seller's listings have the same title. Token matches need a clear
  // lead over the next candidate so "blue sari" never picks a random one.
  if (first.score >= 100) {
    return second?.score === first.score ? null : first.product;
  }
  if (first.score < 60 || (second !== undefined && first.score - second.score < 20)) {
    return null;
  }
  return first.product;
}

/** Normalizes punctuation, case, accents, and whitespace without translating text. */
export function normalizeProductReference(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-IN")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function referenceScore(
  title: string,
  normalizedReference: string,
  referenceTokens: readonly string[],
): number {
  const normalizedTitle = normalizeProductReference(title);
  if (!normalizedTitle) return 0;
  if (normalizedTitle === normalizedReference) return 100;
  if (normalizedTitle.includes(normalizedReference) || normalizedReference.includes(normalizedTitle)) {
    return 90;
  }

  const titleTokens = comparableTokens(normalizedTitle);
  if (titleTokens.length === 0) return 0;
  const matched = titleTokens.filter((titleToken) =>
    referenceTokens.some((referenceToken) => tokensMatch(titleToken, referenceToken)),
  ).length;
  const minimumMatches = Math.min(2, titleTokens.length, referenceTokens.length);
  if (matched < minimumMatches) return 0;

  return Math.round((matched / titleTokens.length) * 100);
}

function comparableTokens(value: string): string[] {
  return value
    .split(" ")
    .map(normalizeToken)
    .filter((token) => token.length > 0);
}

function normalizeToken(token: string): string {
  // English pluralisation is a common STT difference ("pot" / "pots"). Do
  // not stem Indic scripts: their morphology needs language-aware processing.
  return /^[a-z]+$/u.test(token) && token.length > 3 && token.endsWith("s")
    ? token.slice(0, -1)
    : token;
}

function tokensMatch(left: string, right: string): boolean {
  return left === right || (left.length >= 4 && right.length >= 4 && (left.includes(right) || right.includes(left)));
}
