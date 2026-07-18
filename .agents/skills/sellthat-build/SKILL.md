---
name: sellthat-build
description: Build and implement SellThat — a WhatsApp-native marketplace where local sellers list products by text, voice note, and photo in 11 languages (English + 10 Indian), with a React web storefront. Use this skill for ANY SellThat work: scaffolding the Bun+Hono backend or the React/Vite frontend, the Meta WhatsApp Cloud API webhook, the Sarvam voice/language layer (STT/TTS/translate), the gpt-5.4-mini conversation agent, product publishing, the Postgres schema, Docker/nginx/certbot deployment, or the WhatsApp webhook flip. Triggers on "SellThat", "sellthat.in", the WhatsApp seller bot, the marketplace, or any of its backend/frontend/deploy tasks. It encodes the verified models, exact API request shapes, and the specific gotchas that otherwise cause silent failures.
---

# Build SellThat

SellThat lets a local seller list a product from a WhatsApp chat — by text, voice note, or photo, in
their own language — and it appears instantly on the public marketplace at **sellthat.in**. One
promise must never break: **the bot always replies, in the user's language, as text AND a voice note,
and never returns an error or off-topic answer.**

## Read these first (the full source of truth lives at the repo root)

Keep this skill lean; the details are in these companion docs. Read the ones relevant to your task:

- **`SELLTHAT-PLAN.md`** — the complete build plan. Appendix A = copy-paste API request shapes;
  Appendix B = repo layout + the frozen contract; Appendix C = full API selection; §8 = voice/language.
- **`SELLTHAT-RULES.md`** — engineering rules + the gotcha checklist. Follow it exactly.
- **`TRACK-A-BOT-BACKEND.md`** — ordered task list for the backend + bot (owns `backend/`, `infra/initdb/`).
- **`TRACK-B-WEB-DEPLOY.md`** — ordered task list for web + deploy (owns `frontend/`, `docker-compose.yml`, `infra/nginx/`).

Work from the track file for your window. The two tracks run in parallel and never edit the same
files — the only shared surface is the API contract and button ids in Appendix B.

## Locked stack & models (do not substitute)

- Backend: **Bun + Hono**; DB: **PostgreSQL 16** via `postgres` (porsager) tagged-template queries (no ORM).
- Frontend: **React + Vite + Tailwind** SPA, served by nginx.
- Agent brain (all 11 languages, text): **OpenAI `gpt-5.4-mini`**, Chat Completions, tool-calling.
- All voice + language (STT/TTS/translate, all 11 incl. English): **Sarvam** (`saarika:v2.5`,
  `bulbul:v3` speaker `shubh`, `/translate`, `/text-lid`). OpenAI is text-only — never route voice to it.
- Deploy: Docker Compose + host nginx + certbot, behind Cloudflare (Full/strict). Domain `sellthat.in`.

## Golden rules (violating these breaks the product)

- **Reply always** — text AND a voice note, in the user's language, every turn. Never emit a stack
  trace, an English error, or silence. On any STT/TTS/translate failure, degrade gracefully (send the
  text reply; ask the user to resend a bad voice note).
- **ACK the webhook with 200 before doing any work**, then process on a microtask. Meta retries non-200.
- **Verify `X-Hub-Signature-256` over the RAW request body** (HMAC-SHA256, `WHATSAPP_APP_SECRET`,
  constant-time) before parsing anything. Capture the raw bytes before `JSON.parse`.
- **Never invent price or quantity.** If the user didn't state it, ask — one short question at a time.
- **Gates live in code, not the model:** only a verified seller can publish; verification only right
  after the Verify-button tap. Enforce inside the tool handlers.
- **Secrets only in `.env`** (gitignored). Never in git, logs, prompts, or the client bundle.
- **External calls never throw** — 8s timeout, return a typed failure / `null`, log a short reason.
- **Commit bit by bit** — one small, self-contained Conventional Commit per ticked task, and every
  commit builds (`tsc --noEmit` passes). Stage specific files, never `git add .`, never commit `.env`.
  See `SELLTHAT-RULES.md` §13 for the full commit discipline.

## Non-negotiable gotchas (each is a verified, silent-failure trap)

1. **Sarvam Odia = `od-IN`, not `or-IN`.** Remap `or-IN → od-IN` on EVERY Sarvam call.
2. **Sarvam TTS must send `output_audio_codec:"mp3"`.** The default is WAV, which WhatsApp rejects.
   Decode `audios[0]` from base64 → send as `audio/mpeg`.
3. **Sarvam auth header is `api-subscription-key`**, never `Authorization: Bearer`.
4. **Sarvam STT: `language_code=unknown`** to auto-detect the spoken language (handles English too);
   accepts WhatsApp's OGG/Opus directly — no transcoding, no ffmpeg.
5. **`gpt-5.4-mini` rejects `max_tokens`** — use `max_completion_tokens` or omit it. `temperature` is fine.
   Use `tool_choice:"auto"` with a directive system prompt (it reliably calls tools then).
6. **WhatsApp voice note = 2 steps:** upload the mp3 to `POST /<PHONE_NUMBER_ID>/media` (multipart,
   `type=audio/mpeg`) → then send `type:"audio"` with the returned `{id}`.
7. **Send order per turn: text first, then the voice note.** Buttons: ≤3, title ≤20 chars.
8. **Dedup inbound on `message.id`** (Meta re-delivers). Ignore `value.statuses[]`.
9. **`numerals_format:"international"`** on Sarvam `/translate` so ₹ prices keep Western digits.
10. **Webhook flip is deploy-time only** — Meta live-verifies the URL, so it must run after the backend
    answers the GET challenge. The WABA id arrives as `entry[0].id` on the first inbound.
11. **Create `images` before `products`** (FK), and enable `pgcrypto` in the init SQL for `gen_random_uuid()`.

## Build workflow

1. Confirm the repo layout and frozen contract (PLAN Appendix B): ports (backend `127.0.0.1:3300`,
   web `127.0.0.1:3390`), the `Product` JSON shape, the API paths, and the button ids
   (`lang_*`, `role_seller`, `role_buyer`, `verify_yes`, `confirm_yes`, `confirm_edit`).
2. Follow your track file top to bottom, ticking items. Track A: config (fail-fast) → DB → webhook →
   media → `lang.ts` → sender → agent → seller flow → public API → Dockerfile. Track B: SPA → grid +
   detail → wire to API → compose → nginx → certbot → webhook flip.
3. Use the exact request/response shapes in PLAN Appendix A and §7–§8 — do not guess API bodies.
4. Verify each piece against `tsc --noEmit` and one real run through the flow before moving on.
5. Ship the happy path first; polish only if time remains. The bot must never break the "always reply"
   promise, even on a failure path.

## The seller flow (what the agent orchestrates)

`hi` → pick language (auto-detected + offered) → Seller or Buyer (Buyer = "coming soon") → first-time
seller sees the community message + a **Verify me** button → tap verifies (code-guarded) → seller
sends a photo + text/voice describing the product → agent extracts title/price/quantity, infers a
free-text category, asks only for what's missing → shows a draft → **Publish** → product is live on
sellthat.in instantly, and the seller gets the link. Language may switch mid-chat; follow it.
