import { z } from "zod";

const requiredString = z.string().trim().min(1, "is required");
const defaultedString = (fallback: string) =>
  z.string().trim().min(1, "must not be empty").default(fallback);
const optionalString = (fallback: string) => z.string().trim().default(fallback);

const EnvironmentSchema = z.object({
  WHATSAPP_TOKEN: requiredString,
  WHATSAPP_PHONE_NUMBER_ID: requiredString,
  WHATSAPP_APP_SECRET: requiredString,
  WHATSAPP_VERIFY_TOKEN: requiredString,
  OPENAI_API_KEY: requiredString,
  SARVAM_API_KEY: requiredString,
  DATABASE_URL: requiredString,
  WHATSAPP_API_VERSION: defaultedString("v23.0"),
  WHATSAPP_DISPLAY_NUMBER: optionalString(""),
  OPENAI_MODEL: defaultedString("gpt-5.4-mini"),
  SARVAM_STT_MODEL: defaultedString("saarika:v2.5"),
  SARVAM_TTS_MODEL: defaultedString("bulbul:v3"),
  SARVAM_TTS_SPEAKER: defaultedString("shubh"),
  SARVAM_TTS_MAX_CHARS: z.coerce.number().int().positive().default(1200),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  PUBLIC_BASE_URL: z.string().url().default("https://sellthat.in"),
  COMMUNITY_LINK: z.string().url().default(
    "https://chat.whatsapp.com/DummySellThatCommunity01",
  ),
});

type Environment = z.infer<typeof EnvironmentSchema>;

function loadEnvironment(): Environment {
  const parsed = EnvironmentSchema.safeParse(process.env);

  if (parsed.success) {
    return parsed.data;
  }

  const invalidKeys = [
    ...new Set(
      parsed.error.issues.map((issue) => issue.path.join(".")),
    ),
  ];

  throw new Error(
    `Invalid SellThat configuration. Set valid values for: ${invalidKeys.join(", ")}.`,
  );
}

const environment = loadEnvironment();

export const config = Object.freeze({
  whatsappToken: environment.WHATSAPP_TOKEN,
  whatsappPhoneNumberId: environment.WHATSAPP_PHONE_NUMBER_ID,
  whatsappAppSecret: environment.WHATSAPP_APP_SECRET,
  whatsappVerifyToken: environment.WHATSAPP_VERIFY_TOKEN,
  whatsappApiVersion: environment.WHATSAPP_API_VERSION,
  whatsappDisplayNumber: environment.WHATSAPP_DISPLAY_NUMBER,
  openaiApiKey: environment.OPENAI_API_KEY,
  openaiModel: environment.OPENAI_MODEL,
  sarvamApiKey: environment.SARVAM_API_KEY,
  sarvamSttModel: environment.SARVAM_STT_MODEL,
  sarvamTtsModel: environment.SARVAM_TTS_MODEL,
  sarvamTtsSpeaker: environment.SARVAM_TTS_SPEAKER,
  sarvamTtsMaxChars: environment.SARVAM_TTS_MAX_CHARS,
  databaseUrl: environment.DATABASE_URL,
  port: environment.PORT,
  publicBaseUrl: environment.PUBLIC_BASE_URL,
  communityLink: environment.COMMUNITY_LINK,
});

export type AppConfig = typeof config;

export interface ConfigSummary {
  whatsappTokenPresent: boolean;
  whatsappPhoneNumberIdPresent: boolean;
  whatsappAppSecretPresent: boolean;
  whatsappVerifyTokenPresent: boolean;
  openaiApiKeyPresent: boolean;
  sarvamApiKeyPresent: boolean;
  databaseUrlPresent: boolean;
}

export function graphBaseUrl(): string {
  return `https://graph.facebook.com/${config.whatsappApiVersion}`;
}

export function configSummary(): ConfigSummary {
  return {
    whatsappTokenPresent: Boolean(config.whatsappToken),
    whatsappPhoneNumberIdPresent: Boolean(config.whatsappPhoneNumberId),
    whatsappAppSecretPresent: Boolean(config.whatsappAppSecret),
    whatsappVerifyTokenPresent: Boolean(config.whatsappVerifyToken),
    openaiApiKeyPresent: Boolean(config.openaiApiKey),
    sarvamApiKeyPresent: Boolean(config.sarvamApiKey),
    databaseUrlPresent: Boolean(config.databaseUrl),
  };
}
