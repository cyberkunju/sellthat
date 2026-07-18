import { z } from "zod";

import { sql } from "./db";
import type { DraftListing } from "./types";

export const SESSION_STAGES = [
  "new",
  "lang",
  "role",
  "verify_gate",
  "selling",
  "done",
] as const;

export type SessionStage = (typeof SESSION_STAGES)[number];

export const SESSION_ROLES = ["seller", "buyer"] as const;

export type SessionRole = (typeof SESSION_ROLES)[number];

export interface SessionHistoryTurn {
  role: "user" | "assistant" | "tool";
  content: string;
}

export interface Session {
  phone: string;
  stage: SessionStage;
  language: string | null;
  role: SessionRole | null;
  draft: Record<string, unknown>;
  history: SessionHistoryTurn[];
  updatedAt: Date;
}

export type SessionPatch = Partial<
  Pick<Session, "stage" | "language" | "role" | "history">
> & {
  // Agent code uses the typed listing shape while persistence keeps the
  // generic JSON object. Zod below remains the trust boundary for both.
  draft?: Record<string, unknown> | DraftListing;
};

export const MAX_SESSION_HISTORY = 8;

const PhoneSchema = z.string().trim().min(1, "phone is required");
const SessionStageSchema = z.enum(SESSION_STAGES);
const SessionRoleSchema = z.enum(SESSION_ROLES);
const SessionHistoryTurnSchema = z.object({
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string(),
});
const SessionPatchSchema = z.object({
  stage: SessionStageSchema.optional(),
  language: z.string().nullable().optional(),
  role: SessionRoleSchema.nullable().optional(),
  draft: z.record(z.string(), z.unknown()).optional(),
  history: z.array(SessionHistoryTurnSchema).optional(),
});
function jsonParam(value: unknown) {
  // Both draft and history are plain JSON data; sql.json() is the correct way
  // to bind a jsonb value in postgres.js. Casting from unknown avoids the
  // structural overlap error TS raises when narrowing arrays to JSONValue.
  return sql.json(value as Parameters<typeof sql.json>[0]);
}

function parseJsonColumn(value: unknown): unknown {
  // jsonb columns normally arrive already parsed. Tolerate a JSON string too,
  // so any legacy double-encoded row self-heals instead of failing to parse.
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const DraftColumnSchema = z.preprocess(parseJsonColumn, z.record(z.string(), z.unknown()));
const HistoryColumnSchema = z.preprocess(
  parseJsonColumn,
  z.array(SessionHistoryTurnSchema),
);

const SessionRowSchema = z.object({
  phone: PhoneSchema,
  stage: SessionStageSchema,
  language: z.string().nullable(),
  role: SessionRoleSchema.nullable(),
  draft: DraftColumnSchema,
  history: HistoryColumnSchema,
  updated_at: z.coerce.date(),
});

type SessionRow = z.infer<typeof SessionRowSchema>;

function normalizePhone(phone: string): string {
  return PhoneSchema.parse(phone);
}

function toSession(row: unknown): Session {
  const parsed = SessionRowSchema.parse(row);

  return {
    phone: parsed.phone,
    stage: parsed.stage,
    language: parsed.language,
    role: parsed.role,
    draft: parsed.draft,
    history: parsed.history,
    updatedAt: parsed.updated_at,
  };
}

async function findSession(phone: string): Promise<Session | null> {
  const rows = await sql<SessionRow[]>`
    select phone, stage, language, role, draft, history, updated_at
    from sessions
    where phone = ${phone}
  `;
  const row = rows[0];

  return row ? toSession(row) : null;
}

export async function createSession(phone: string): Promise<Session> {
  const normalizedPhone = normalizePhone(phone);
  const rows = await sql<SessionRow[]>`
    insert into sessions (phone)
    values (${normalizedPhone})
    on conflict (phone) do nothing
    returning phone, stage, language, role, draft, history, updated_at
  `;
  const created = rows[0];

  if (created) {
    return toSession(created);
  }

  const existing = await findSession(normalizedPhone);

  if (existing) {
    return existing;
  }

  throw new Error("Session could not be created or loaded.");
}

export async function getSession(phone: string): Promise<Session> {
  const normalizedPhone = normalizePhone(phone);
  const existing = await findSession(normalizedPhone);

  return existing ?? createSession(normalizedPhone);
}

export async function saveSession(
  phone: string,
  patch: SessionPatch,
): Promise<Session> {
  const normalizedPhone = normalizePhone(phone);
  const safePatch = SessionPatchSchema.parse(patch);
  const current = await getSession(normalizedPhone);
  const history = (safePatch.history ?? current.history).slice(-MAX_SESSION_HISTORY);
  const next = {
    stage: safePatch.stage ?? current.stage,
    language:
      safePatch.language === undefined ? current.language : safePatch.language,
    role: safePatch.role === undefined ? current.role : safePatch.role,
    draft: safePatch.draft ?? current.draft,
    history,
  };
  const rows = await sql<SessionRow[]>`
    update sessions
    set
      stage = ${next.stage},
      language = ${next.language},
      role = ${next.role},
      draft = ${jsonParam(next.draft)},
      history = ${jsonParam(next.history)},
      updated_at = now()
    where phone = ${normalizedPhone}
    returning phone, stage, language, role, draft, history, updated_at
  `;
  const updated = rows[0];

  if (!updated) {
    throw new Error("Session update failed.");
  }

  return toSession(updated);
}

export async function deleteSession(phone: string): Promise<void> {
  const normalizedPhone = normalizePhone(phone);
  await sql`delete from sessions where phone = ${normalizedPhone}`;
}

export function appendHistory(
  session: Pick<Session, "history">,
  turn: SessionHistoryTurn,
): SessionHistoryTurn[] {
  const checkedTurn = SessionHistoryTurnSchema.parse(turn);

  return [...session.history, checkedTurn].slice(-MAX_SESSION_HISTORY);
}
