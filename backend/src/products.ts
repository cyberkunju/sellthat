import { z } from "zod";

import { sql } from "./db";
import type { DraftListing, PublicProduct, Seller, StoredImage } from "./types";

interface ProductRow {
  id: string;
  title: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  imageId: string | null;
  sellerName: string | null;
  sellerLocation: string | null;
  createdAt: Date | string;
}

interface SellerRow {
  id: string;
  phone: string;
  name: string | null;
  location: string | null;
  language: string;
  isVerified: boolean;
}

const PublishDraftSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2_000).optional(),
  price: z.number().int().nonnegative().max(2_147_483_647),
  quantity: z.number().int().positive().max(2_147_483_647),
  category: z.string().trim().min(1).max(80).optional(),
  imageId: z.string().uuid().optional(),
  allowHardFactEdit: z.boolean().optional(),
  confirmationReady: z.literal(true),
  confirmationMessageId: z.string().trim().min(1).max(256),
});

function asPublicProduct(row: ProductRow): PublicProduct {
  const createdAt = row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt;

  return {
    id: row.id,
    title: row.title,
    price: row.price,
    quantity: row.quantity,
    category: row.category,
    description: row.description,
    imageUrl: row.imageId ? `/media/${row.imageId}` : null,
    sellerName: row.sellerName,
    sellerLocation: row.sellerLocation,
    createdAt,
  };
}

function asSeller(row: SellerRow): Seller {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    location: row.location,
    language: row.language as Seller["language"],
    isVerified: row.isVerified,
  };
}

export async function ensureSeller(
  phone: string,
  name: string | undefined,
  language: Seller["language"],
): Promise<Seller> {
  const rows = await sql<SellerRow[]>`
    insert into sellers (phone, name, language)
    values (${phone}, ${name ?? null}, ${language})
    on conflict (phone) do update
      set name = coalesce(excluded.name, sellers.name),
          language = excluded.language,
          updated_at = now()
    returning
      id::text as id,
      phone,
      name,
      location,
      language,
      is_verified as "isVerified"
  `;

  const seller = rows[0];
  if (!seller) {
    throw new Error("Seller upsert returned no row");
  }

  return asSeller(seller);
}

export async function getSeller(phone: string): Promise<Seller | null> {
  const rows = await sql<SellerRow[]>`
    select
      id::text as id,
      phone,
      name,
      location,
      language,
      is_verified as "isVerified"
    from sellers
    where phone = ${phone}
    limit 1
  `;

  return rows[0] ? asSeller(rows[0]) : null;
}

export async function markSellerVerified(phone: string): Promise<Seller | null> {
  const rows = await sql<SellerRow[]>`
    update sellers
    set is_verified = true, updated_at = now()
    where phone = ${phone}
    returning
      id::text as id,
      phone,
      name,
      location,
      language,
      is_verified as "isVerified"
  `;

  return rows[0] ? asSeller(rows[0]) : null;
}

export async function storeImage(bytes: Uint8Array, mime: string): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    insert into images (mime, bytes)
    values (${mime}, ${bytes})
    returning id::text as id
  `;
  const image = rows[0];
  if (!image) {
    throw new Error("Image insert returned no row");
  }
  return image.id;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  const rows = await sql<{ id: string; mime: string; bytes: Uint8Array }[]>`
    select id::text as id, mime, bytes
    from images
    where id = ${id}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function listProducts(): Promise<PublicProduct[]> {
  const rows = await sql<ProductRow[]>`
    select
      p.id::text as id,
      p.title,
      p.price,
      p.quantity,
      p.category,
      p.description,
      p.image_id::text as "imageId",
      p.seller_name as "sellerName",
      p.seller_location as "sellerLocation",
      p.created_at as "createdAt"
    from products p
    order by p.created_at desc
  `;
  return rows.map(asPublicProduct);
}

export async function getProduct(id: string): Promise<PublicProduct | null> {
  const rows = await sql<ProductRow[]>`
    select
      p.id::text as id,
      p.title,
      p.price,
      p.quantity,
      p.category,
      p.description,
      p.image_id::text as "imageId",
      p.seller_name as "sellerName",
      p.seller_location as "sellerLocation",
      p.created_at as "createdAt"
    from products p
    where p.id = ${id}::uuid
    limit 1
  `;
  return rows[0] ? asPublicProduct(rows[0]) : null;
}

/**
 * Atomically publish the current session draft. The session row is locked so
 * a retried or concurrent Publish tap observes the cleared draft rather than
 * inserting a duplicate product.
 */
export async function publishSessionDraft(
  phone: string,
  confirmationMessageId: string,
): Promise<PublicProduct | null> {
  return sql.begin(async (transaction) => {
    const sessionRows = await transaction<{ draft: unknown }[]>`
      select draft
      from sessions
      where phone = ${phone}
      for update
    `;
    const session = sessionRows[0];
    if (!session) return null;

    const draft = PublishDraftSchema.safeParse(session.draft);
    if (!draft.success) return null;
    if (draft.data.confirmationMessageId !== confirmationMessageId) return null;

    const sellerRows = await transaction<SellerRow[]>`
      select
        id::text as id,
        phone,
        name,
        location,
        language,
        is_verified as "isVerified"
      from sellers
      where phone = ${phone}
      for update
    `;
    const sellerRow = sellerRows[0];
    if (!sellerRow) return null;

    const seller = asSeller(sellerRow);
    if (!seller.isVerified) return null;

    const rows = await transaction<ProductRow[]>`
      insert into products (
        seller_id,
        title,
        description,
        price,
        quantity,
        category,
        image_id,
        seller_name,
        seller_location,
        language
      )
      values (
        ${seller.id}::uuid,
        ${draft.data.title},
        ${draft.data.description ?? ""},
        ${draft.data.price},
        ${draft.data.quantity},
        ${draft.data.category ?? "General"},
        ${draft.data.imageId ?? null}::uuid,
        ${seller.name},
        ${seller.location},
        ${seller.language}
      )
      returning
        id::text as id,
        title,
        price,
        quantity,
        category,
        description,
        image_id::text as "imageId",
        seller_name as "sellerName",
        seller_location as "sellerLocation",
        created_at as "createdAt"
    `;
    const product = rows[0];
    if (!product) return null;

    await transaction`
      update sessions
      set draft = '{}'::jsonb, stage = 'selling', updated_at = now()
      where phone = ${phone}
    `;

    return asPublicProduct(product);
  });
}
