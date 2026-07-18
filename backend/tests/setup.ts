// Preloaded before test files (see bunfig.toml). config.ts fail-fasts on a
// missing key at import time; these dummy values let the pure-function tests
// import it without any real secret. Real values still come from .env at runtime.
const defaults: Record<string, string> = {
  WHATSAPP_TOKEN: "test-token",
  WHATSAPP_PHONE_NUMBER_ID: "test-phone-id",
  WHATSAPP_APP_SECRET: "test-app-secret",
  WHATSAPP_VERIFY_TOKEN: "test-verify-token",
  OPENAI_API_KEY: "test-openai-key",
  SARVAM_API_KEY: "test-sarvam-key",
  DATABASE_URL: "postgres://sellthat:sellthat@localhost:5432/sellthat",
};

for (const [key, value] of Object.entries(defaults)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}
