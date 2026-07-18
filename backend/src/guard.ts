/** Base copy is intentionally language-neutral; the reply path localizes it before sending. */
export const LISTING_REDIRECT_BASE =
  "I can help you list a product. Please tell me what you want to sell.";

export const SELF_HARM_SUPPORT_BASE =
  "I'm really sorry you're going through this. Please contact local emergency services or a trusted person near you right now. If you may act on these feelings, seek urgent help now.";

export type GuardrailKind = "prompt_injection" | "self_harm";

export interface GuardrailResult {
  kind: GuardrailKind | null;
  promptInjection: boolean;
  selfHarm: boolean;
}

const PROMPT_INJECTION_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(?:ignore|disregard|forget|override)\b.{0,80}\b(?:previous|prior|above|system|instructions?|rules?)\b/i,
  /\b(?:reveal|show|print|repeat|dump)\b.{0,80}\b(?:system prompt|hidden prompt|developer message|instructions?)\b/i,
  /\b(?:jailbreak|dan mode|developer mode|system message)\b/i,
  /\b(?:act as|pretend to be)\b.{0,50}\b(?:system|developer|assistant|chatgpt)\b/i,
];

const SELF_HARM_PATTERN =
  /\b(?:kill|hurt|harm|cut)\s+(?:myself|my\s*self)\b|\b(?:suicide|suicidal|want\s+to\s+die|do(?:n't| not)\s+want\s+to\s+live|end\s+(?:my\s+)?life|end\s+it\s+all)\b|आत्महत्या|खुद\s*को\s*मार|মৃত্যু\s*চাই|আত্মহত্যা|নিজেকে\s*মেরে|ఆత్మహత్య|తనను\s*చంప|தற்கொலை|என்னை\s*கொல்ல|આત્મહત્યા|પોતાને\s*મારી|ಆತ್ಮಹತ್ಯೆ|ನನ್ನನ್ನು\s*ಕೊಲ್ಲ|ആത്മഹത്യ|എന്നെ\s*കൊല്ല|ਆਤਮਹੱਤਿਆ|ਆਪਣੇ\s*ਆਪ\s*ਨੂੰ\s*ਮਾਰ|ଆତ୍ମହତ୍ୟା|ନିଜକୁ\s*ମାର/i;

export function hasPromptInjection(text: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

export function hasSelfHarmSignal(text: string): boolean {
  return SELF_HARM_PATTERN.test(text);
}

/** Self-harm takes priority when a message triggers both cheap pre-model shields. */
export function checkGuardrails(text: string): GuardrailResult {
  const selfHarm = hasSelfHarmSignal(text);
  const promptInjection = hasPromptInjection(text);

  return {
    kind: selfHarm ? "self_harm" : promptInjection ? "prompt_injection" : null,
    promptInjection,
    selfHarm,
  };
}
