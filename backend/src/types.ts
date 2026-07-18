export const LANGUAGE_CODES = [
  "en-IN",
  "hi-IN",
  "bn-IN",
  "te-IN",
  "mr-IN",
  "ta-IN",
  "gu-IN",
  "kn-IN",
  "ml-IN",
  "pa-IN",
  "or-IN",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type SellerRole = "seller" | "buyer";
export type ConversationStage =
  | "new"
  | "lang"
  | "role"
  | "verify_gate"
  | "selling"
  | "done";

export interface DraftListing {
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  imageId?: string;
  /** Set only by the explicit Edit button; never supplied by the model. */
  allowHardFactEdit?: boolean;
  /** Set only after this exact draft has been shown with a Publish button. */
  confirmationReady?: boolean;
  /** Meta id of the exact outbound confirmation interactive message. */
  confirmationMessageId?: string;
  /**
   * Set by deterministic copy after asking for the next missing hard fact.
   * It lets a bare numeric reply be interpreted only in that unambiguous
   * follow-up turn; the model can never set this field.
   */
  expectedHardFact?: "price" | "quantity";
}

export interface HistoryTurn {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  phone: string;
  stage: ConversationStage;
  language: LanguageCode | null;
  role: SellerRole | null;
  draft: DraftListing;
  history: HistoryTurn[];
  updatedAt: Date | string;
}

export interface Seller {
  id: string;
  phone: string;
  name: string | null;
  location: string | null;
  language: LanguageCode;
  isVerified: boolean;
}

export interface PublicProduct {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  imageUrl: string | null;
  sellerName: string | null;
  sellerLocation: string | null;
  createdAt: string;
}

export interface StoredImage {
  id: string;
  mime: string;
  bytes: Uint8Array;
}

export interface ReplyButton {
  id: string;
  title: string;
}

export interface InboundMediaRef {
  id: string;
  mimeType?: string;
}

export interface InboundMessage {
  id: string;
  from: string;
  name?: string;
  type: "text" | "audio" | "image" | "interactive" | "button" | "unknown";
  text?: string;
  buttonId?: string;
  /** Meta context.id for the outbound message this response is attached to. */
  contextMessageId?: string;
  media?: InboundMediaRef;
  wabaId?: string;
}
