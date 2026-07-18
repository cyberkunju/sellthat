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
export const PRODUCT_STATUSES = ["active", "sold_out", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export const DIRECT_PRODUCT_MANAGEMENT_ACTIONS = [
  "show_actions",
  "edit_price",
  "edit_quantity",
  "edit_details",
  "improve_details",
  "replace_photo",
  "remove",
  "archive",
  "restore",
  "sold_out",
  "restock",
] as const;
export type DirectProductManagementAction = (typeof DIRECT_PRODUCT_MANAGEMENT_ACTIONS)[number];

/**
 * Fields a seller may change on one of their own published products.
 * Undefined leaves a value unchanged; imageId: null removes its image.
 */
export interface SellerProductPatch {
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  imageId?: string | null;
  status?: ProductStatus;
}

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
  /** Meta id of the exact outbound Verify interactive message. */
  verificationMessageId?: string;
  /** Meta id of the exact outbound seller-menu interactive message. */
  sellerMenuMessageId?: string;
  /**
   * Set by deterministic copy after asking for the next missing hard fact.
   * It lets a bare numeric reply be interpreted only in that unambiguous
   * follow-up turn; the model can never set this field.
   */
  expectedHardFact?: "price" | "quantity";
  /**
   * Deterministic context for a seller's post-publish management flow.
   * Only button/context handlers may set these values; the model never does.
   */
  management?: {
    productListMessageId?: string;
    /** Zero-based page for a long seller-owned listing picker. */
    productListPage?: number;
    actionListMessageId?: string;
      confirmationMessageId?: string;
      selectedProductId?: string;
      /** Product revision observed when this management state was created. */
      expectedProductUpdatedAt?: string;
      action?:
      | "edit_price"
      | "edit_quantity"
      | "edit_details"
      | "replace_photo"
      | "archive"
      | "restore"
      | "sold_out"
      | "restock";
    pendingPatch?: SellerProductPatch;
    /** A spoken/typed request retained while the seller chooses an ambiguous product. */
    directRequest?: {
      action: DirectProductManagementAction;
      patch?: SellerProductPatch;
    };
  };
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
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
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
