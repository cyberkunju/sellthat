import type { InboundMessage as ApplicationInboundMessage } from "../types";

/**
 * The small, safe subset of a Meta webhook that the rest of the application
 * may trust. Unknown fields and delivery/status updates are intentionally
 * discarded at this boundary.
 */
export type InboundMessageType =
  | "text"
  | "image"
  | "audio"
  | "interactive"
  | "button"
  | "unknown";

export interface InboundMediaRef {
  id: string;
  mimeType?: string;
  caption?: string;
}

/**
 * Extends the app-wide inbound shape, so server/agent code can consume a
 * normalized webhook message without an adapter. Optional values are omitted
 * instead of represented as null at this application boundary.
 */
export interface InboundMessage extends ApplicationInboundMessage {
  type: InboundMessageType;
  /** Backward-compatible descriptive alias for `name`. */
  senderName?: string;
  timestamp?: string;
  buttonTitle?: string;
  media?: InboundMediaRef;
}

export interface ParsedWebhookPayload {
  messages: InboundMessage[];
  /** Present on the first real inbound delivery and useful for webhook flip. */
  wabaIds: string[];
}

type UnknownRecord = Record<string, unknown>;

/**
 * Validate and normalise a Meta webhook envelope without trusting arbitrary
 * JSON. It never throws, so an unexpected Meta payload cannot escape the
 * webhook's per-delivery error isolation.
 */
export function parseWebhookPayload(payload: unknown): ParsedWebhookPayload {
  const root = asRecord(payload);

  if (root === null) {
    return { messages: [], wabaIds: [] };
  }

  const messages: InboundMessage[] = [];
  const wabaIds = new Set<string>();

  for (const entryValue of asArray(root.entry)) {
    const entry = asRecord(entryValue);

    if (entry === null) {
      continue;
    }

    const wabaId = nonEmptyString(entry.id);
    if (wabaId !== null) {
      wabaIds.add(wabaId);
    }

    for (const changeValue of asArray(entry.changes)) {
      const change = asRecord(changeValue);
      const value = change === null ? null : asRecord(change.value);

      if (value === null) {
        continue;
      }

      const namesByPhone = contactNames(value);

      // Intentionally inspect only value.messages. Meta's value.statuses is
      // delivery bookkeeping, not a new seller turn.
      for (const messageValue of asArray(value.messages)) {
        const message = normaliseMessage(messageValue, namesByPhone, wabaId);
        if (message !== null) {
          messages.push(message);
        }
      }
    }
  }

  return { messages, wabaIds: [...wabaIds] };
}

/** Convenience export for callers that only need actionable inbound turns. */
export function parseInboundMessages(payload: unknown): InboundMessage[] {
  return parseWebhookPayload(payload).messages;
}

/** Alias with the wording used in the integration plan. */
export const normalizeWebhookPayload = parseWebhookPayload;

function normaliseMessage(
  value: unknown,
  namesByPhone: ReadonlyMap<string, string>,
  wabaId: string | null,
): InboundMessage | null {
  const message = asRecord(value);

  if (message === null) {
    return null;
  }

  const id = nonEmptyString(message.id);
  const from = nonEmptyString(message.from);
  const type = nonEmptyString(message.type);

  if (id === null || from === null || type === null) {
    return null;
  }

  const name = namesByPhone.get(from);
  const timestamp = stringOrNull(message.timestamp);
  const context = asRecord(message.context);
  const contextMessageId = context === null ? null : nonEmptyString(context.id);
  const base = {
    id,
    from,
    ...(name === undefined ? {} : { name, senderName: name }),
    ...(wabaId === null ? {} : { wabaId }),
    ...(timestamp === null ? {} : { timestamp }),
    ...(contextMessageId === null ? {} : { contextMessageId }),
  };

  switch (type) {
    case "text": {
      const text = asRecord(message.text);
      const body = text === null ? null : stringOrNull(text.body);

      if (body === null) return { ...base, type: "unknown" };

      return {
        ...base,
        type,
        text: body,
      };
    }

    case "image": {
      const image = asRecord(message.image);
      const mediaId = image === null ? null : nonEmptyString(image.id);

      if (mediaId === null) return { ...base, type: "unknown" };

      const caption = image === null ? null : stringOrNull(image.caption);
      const mimeType = image === null ? null : stringOrNull(image.mime_type);
      return {
        ...base,
        type,
        ...(caption === null ? {} : { text: caption }),
        media: {
          id: mediaId,
          ...(mimeType === null ? {} : { mimeType }),
          ...(caption === null ? {} : { caption }),
        },
      };
    }

    case "audio": {
      const audio = asRecord(message.audio);
      const mediaId = audio === null ? null : nonEmptyString(audio.id);

      if (mediaId === null) return { ...base, type: "unknown" };

      const mimeType = audio === null ? null : stringOrNull(audio.mime_type);
      return {
        ...base,
        type,
        media: {
          id: mediaId,
          ...(mimeType === null ? {} : { mimeType }),
        },
      };
    }

    case "interactive": {
      const interactive = asRecord(message.interactive);
      if (interactive === null) return { ...base, type: "unknown" };

      // `button_reply` is the normal path. Supporting `list_reply` costs
      // little and lets an eventual language picker use a list safely.
      const reply =
        asRecord(interactive.button_reply) ?? asRecord(interactive.list_reply);
      const buttonId = reply === null ? null : nonEmptyString(reply.id);

      // Flow/nfm and future interactive reply types do not have a safe
      // button id we recognize. Preserve the sender/id as an unknown turn so
      // the bot can still reply instead of silently dropping the message.
      if (buttonId === null) return { ...base, type: "unknown" };

      const buttonTitle = reply === null ? null : stringOrNull(reply.title);
      return {
        ...base,
        type,
        ...(buttonTitle === null ? {} : { text: buttonTitle }),
        buttonId,
        ...(buttonTitle === null ? {} : { buttonTitle }),
      };
    }

    case "button": {
      const button = asRecord(message.button);
      const text = button === null ? null : stringOrNull(button.text);
      const buttonId =
        button === null
          ? null
          : nonEmptyString(button.payload) ?? nonEmptyString(button.id);

      // Legacy buttons supply text. A payload is useful when available but is
      // not required to preserve an otherwise valid human response.
      if (text === null && buttonId === null) return { ...base, type: "unknown" };

      return {
        ...base,
        type,
        ...(text === null ? {} : { text, buttonTitle: text }),
        ...(buttonId === null ? {} : { buttonId }),
      };
    }

    default:
      // Still dispatch a normalized turn so unsupported attachments never
      // violate SellThat's always-reply promise. No raw unknown payload is
      // forwarded into the agent.
      return { ...base, type: "unknown" };
  }
}

/** Read sender names from Meta's change.value.contacts array. */
function contactNames(value: unknown): Map<string, string> {
  const names = new Map<string, string>();
  const changeValue = asRecord(value);

  if (changeValue === null) {
    return names;
  }

  for (const contactValue of asArray(changeValue.contacts)) {
    const contact = asRecord(contactValue);
    if (contact === null) {
      continue;
    }

    const phone = nonEmptyString(contact.wa_id);
    const profile = asRecord(contact.profile);
    const name = profile === null ? null : nonEmptyString(profile.name);

    if (phone !== null && name !== null) {
      names.set(phone, name);
    }
  }

  return names;
}

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
