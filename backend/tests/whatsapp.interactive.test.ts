import { describe, expect, it } from "bun:test";

import {
  languageButtons,
  moreLanguagesList,
  sellerMenuButtons,
  verifyButtons,
} from "../src/copy";
import { LANGUAGE_CODES } from "../src/types";
import { parseWebhookPayload } from "../src/whatsapp/parse";
import {
  createWhatsAppSender,
  type ReplyList,
} from "../src/whatsapp/sender";

type SentCall = {
  kind: "text" | "button" | "list" | "audio" | "media";
  payload?: Record<string, unknown>;
};

function createCapturedSender(): {
  calls: SentCall[];
  sender: ReturnType<typeof createWhatsAppSender>;
} {
  const calls: SentCall[] = [];
  let sentMessageCount = 0;

  const fakeFetch = async (
    ...[input, init]: Parameters<typeof globalThis.fetch>
  ): Promise<Response> => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

    if (url.endsWith("/media")) {
      calls.push({ kind: "media" });
      return graphResponse({ id: "media-123" });
    }

    const body = init?.body;
    if (typeof body !== "string") {
      throw new Error("expected a JSON Graph API payload");
    }

    const payload = JSON.parse(body) as Record<string, unknown>;
    calls.push({ kind: messageKind(payload), payload });
    sentMessageCount += 1;
    return graphResponse({ messages: [{ id: `wamid-${sentMessageCount}` }] });
  };
  const fetcher = fakeFetch as typeof globalThis.fetch;

  return {
    calls,
    sender: createWhatsAppSender({
      token: "test-token",
      phoneNumberId: "test-phone-id",
      graphBaseUrl: "https://graph.example.test/v1",
      fetch: fetcher,
      speak: async () => ({ mp3Bytes: new Uint8Array([1, 2, 3]) }),
    }),
  };
}

function graphResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function messageKind(payload: Record<string, unknown>): SentCall["kind"] {
  if (payload.type === "text") return "text";
  if (payload.type === "audio") return "audio";

  const interactive = payload.interactive;
  if (typeof interactive === "object" && interactive !== null) {
    const type = (interactive as Record<string, unknown>).type;
    if (type === "button") return "button";
    if (type === "list") return "list";
  }

  throw new Error("unexpected Graph API message payload");
}

function validList(): ReplyList {
  return {
    body: "Choose a language from the list.",
    button: "Choose language",
    sections: [{
      title: "Languages",
      rows: [{ id: "lang_ta-IN", title: "தமிழ்", description: "Tamil" }],
    }],
  };
}

describe("WhatsApp interactive sender", () => {
  it("sends only the interactive control (no duplicate text) then the voice note", async () => {
    const { calls, sender } = createCapturedSender();

    const result = await sender.reply(
      "919876543210",
      "Choose your role.",
      "en-IN",
      [{ id: "role_seller", title: "Seller" }],
    );

    // The button message already renders its own body text, so there must be
    // no separate plain-text message duplicating it.
    expect(calls.map((call) => call.kind)).toEqual(["button", "media", "audio"]);
    expect(result.interactive).toEqual({ ok: true, messageId: "wamid-1" });
    expect(result.text).toEqual({ ok: true, messageId: "wamid-1" });
    expect(result.voice).toEqual({ ok: true, messageId: "wamid-2" });

    expect(calls[0]?.payload).toMatchObject({
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "Choose your role." },
        action: {
          buttons: [{ type: "reply", reply: { id: "role_seller", title: "Seller" } }],
        },
      },
    });
  });

  it("sends a single plain text message when there is no interactive control", async () => {
    const { calls, sender } = createCapturedSender();

    await sender.reply("919876543210", "Welcome to SellThat!", "en-IN");

    expect(calls.map((call) => call.kind)).toEqual(["text", "media", "audio"]);
  });

  it("uses a list as the single optional interactive reply", async () => {
    const { calls, sender } = createCapturedSender();

    const result = await sender.reply(
      "919876543210",
      "Choose a language from the list.",
      "en-IN",
      undefined,
      validList(),
    );

    expect(calls.map((call) => call.kind)).toEqual(["list", "media", "audio"]);
    expect(result.interactive).toEqual({ ok: true, messageId: "wamid-1" });
  });

  it("emits Meta's list payload and rejects invalid list limits before sending", async () => {
    const { calls, sender } = createCapturedSender();
    const list = validList();

    const result = await sender.sendList("919876543210", list);

    expect(result).toEqual({ ok: true, messageId: "wamid-1" });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.payload).toEqual({
      messaging_product: "whatsapp",
      to: "919876543210",
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Choose a language from the list." },
        action: {
          button: "Choose language",
          sections: [{
            title: "Languages",
            rows: [{ id: "lang_ta-IN", title: "தமிழ்", description: "Tamil" }],
          }],
        },
      },
    });

    const invalidLists: ReplyList[] = [
      { ...list, button: "x".repeat(21) },
      { ...list, sections: [] },
      { ...list, sections: [{ title: "x".repeat(25), rows: list.sections[0]?.rows ?? [] }] },
      { ...list, sections: [{ title: "Languages", rows: [{ id: "a", title: "x".repeat(25) }] }] },
      { ...list, sections: [{ title: "Languages", rows: [{ id: "a", title: "Tamil", description: "x".repeat(73) }] }] },
      { ...list, sections: [{ title: "Languages", rows: [{ id: "x".repeat(201), title: "Tamil" }] }] },
      {
        ...list,
        sections: Array.from({ length: 11 }, (_, index) => ({
          title: `Section ${index}`,
          rows: [{ id: `language-${index}`, title: "Tamil" }],
        })),
      },
      {
        ...list,
        sections: [{
          title: "Languages",
          rows: Array.from({ length: 11 }, (_, index) => ({
            id: `language-${index}`,
            title: "Tamil",
          })),
        }],
      },
    ];

    for (const invalid of invalidLists) {
      await expect(sender.sendList("919876543210", invalid)).resolves.toEqual({
        ok: false,
        errorCode: "invalid_list_message",
      });
    }

    expect(calls).toHaveLength(1);
  });

  it("makes every supported language tap-selectable with safe localized labels", () => {
    expect(languageButtons()).toEqual([
      { id: "lang_en-IN", title: "English" },
      { id: "lang_hi-IN", title: "हिंदी" },
      { id: "lang_more", title: "All languages" },
    ]);

    const ids = moreLanguagesList("en-IN").sections[0]?.rows.map((row) => row.id);
    expect(ids).toEqual([
      "lang_bn-IN",
      "lang_te-IN",
      "lang_mr-IN",
      "lang_ta-IN",
      "lang_gu-IN",
      "lang_kn-IN",
      "lang_ml-IN",
      "lang_pa-IN",
      "lang_or-IN",
    ]);

    for (const language of LANGUAGE_CODES) {
      const list = moreLanguagesList(language);
      const section = list.sections[0];
      if (section === undefined) throw new Error("expected a language list section");

      expect(Array.from(list.button).length).toBeGreaterThan(0);
      expect(Array.from(list.button).length).toBeLessThanOrEqual(20);
      expect(Array.from(section.title ?? "").length).toBeGreaterThan(0);
      expect(Array.from(section.title ?? "").length).toBeLessThanOrEqual(24);
      expect(section.rows).toHaveLength(9);
      expect(verifyButtons(language)).toHaveLength(1);
      expect(Array.from(verifyButtons(language)[0]?.title ?? "").length).toBeLessThanOrEqual(20);
      for (const button of sellerMenuButtons(language)) {
        expect(Array.from(button.title).length).toBeGreaterThan(0);
        expect(Array.from(button.title).length).toBeLessThanOrEqual(20);
      }
    }
  });
});

describe("Meta webhook parser", () => {
  it("uses the contact name nested in change.value.contacts", () => {
    const parsed = parseWebhookPayload({
      entry: [{
        id: "waba-123",
        changes: [{
          value: {
            contacts: [{ wa_id: "919876543210", profile: { name: " Asha Devi " } }],
            messages: [{
              id: "wamid.inbound-1",
              from: "919876543210",
              timestamp: "1710000000",
              type: "interactive",
              interactive: { list_reply: { id: "lang_ta-IN", title: "தமிழ்" } },
            }],
          },
        }],
      }],
    });

    expect(parsed.wabaIds).toEqual(["waba-123"]);
    expect(parsed.messages).toEqual([{
      id: "wamid.inbound-1",
      from: "919876543210",
      name: "Asha Devi",
      senderName: "Asha Devi",
      wabaId: "waba-123",
      timestamp: "1710000000",
      type: "interactive",
      text: "தமிழ்",
      buttonId: "lang_ta-IN",
      buttonTitle: "தமிழ்",
    }]);
  });
});
