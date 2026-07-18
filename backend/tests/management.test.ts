import { describe, expect, it } from "bun:test";

import { normalizeProductReference, resolveUniqueProductReference } from "../src/management";
import type { PublicProduct } from "../src/types";

const products: PublicProduct[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Blue Silk Sari",
    description: "A blue silk sari.",
    price: 1200,
    quantity: 2,
    category: "Clothing",
    imageUrl: null,
    sellerName: null,
    sellerLocation: null,
    status: "active",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Blue Cotton Sari",
    description: "A blue cotton sari.",
    price: 900,
    quantity: 3,
    category: "Clothing",
    imageUrl: null,
    sellerName: null,
    sellerLocation: null,
    status: "active",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Handmade Clay Pots",
    description: "Clay pots.",
    price: 200,
    quantity: 10,
    category: "Home",
    imageUrl: null,
    sellerName: null,
    sellerLocation: null,
    status: "active",
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
];

describe("seller product reference resolution", () => {
  it("accepts an exact normalized product-name match", () => {
    expect(resolveUniqueProductReference(products, "  handmade clay pots! ")?.id)
      .toBe("33333333-3333-4333-8333-333333333333");
  });

  it("accepts a uniquely strong spoken singular/plural match", () => {
    expect(resolveUniqueProductReference(products, "old clay pot")?.id)
      .toBe("33333333-3333-4333-8333-333333333333");
  });

  it("refuses an ambiguous product reference", () => {
    expect(resolveUniqueProductReference(products, "blue sari")).toBeNull();
  });

  it("refuses a product reference with no seller-owned match", () => {
    expect(resolveUniqueProductReference(products, "green chair")).toBeNull();
  });

  it("normalizes punctuation and case without translating the product name", () => {
    expect(normalizeProductReference("  Blue—Silk  Sari ")).toBe("blue silk sari");
  });
});
