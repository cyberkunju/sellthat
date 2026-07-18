import { z } from "zod";

import { sql } from "./db";
import {
  PRODUCT_STATUSES,
  type DraftListing,
  type ProductStatus,
  type PublicProduct,
  type Seller,
  type StoredImage,
} from "./types";

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
  status: ProductStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
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

const ProductIdSchema = z.string().uuid();
const SellerPhoneSchema = z.string().trim().min(1).max(128);
const SellerProductPatchSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(2_000).optional(),
    price: z.number().int().nonnegative().max(2_147_483_647).optional(),
    quantity: z.number().int().positive().max(2_147_483_647).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    imageId: z.string().uuid().nullable().optional(),
    status: z.enum(PRODUCT_STATUSES).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "At least one product field is required",
  });

function asPublicProduct(row: ProductRow): PublicProduct {
  const createdAt = row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt;
  const updatedAt = row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt;

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
    status: row.status,
    createdAt,
    updatedAt,
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

/**
 * Full demo reset for one seller: clear their verified state and delete all of
 * their products plus the listing images those products referenced. Products
 * are deleted before their images because products.image_id has no ON DELETE
 * rule. Scoped to a single phone and triggered only by that seller's own reset.
 */
export async function resetSellerData(phone: string): Promise<void> {
  const parsedPhone = SellerPhoneSchema.safeParse(phone);
  if (!parsedPhone.success) return;

  await sql.begin(async (transaction) => {
    const rows = await transaction<{ id: string }[]>`
      update sellers
      set is_verified = false, updated_at = now()
      where phone = ${parsedPhone.data}
      returning id::text as id
    `;
    const seller = rows[0];
    if (!seller) return;

    const imageRows = await transaction<{ imageId: string }[]>`
      select image_id::text as "imageId"
      from products
      where seller_id = ${seller.id}::uuid and image_id is not null
    `;
    const imageIds = imageRows.map((row) => row.imageId);

    await transaction`delete from products where seller_id = ${seller.id}::uuid`;

    if (imageIds.length > 0) {
      await transaction`delete from images where id = any(${imageIds}::uuid[])`;
    }
  });
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
      p.status,
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    from products p
    where p.status in ('active', 'sold_out')
    order by p.created_at desc
  `;
  return rows.map(asPublicProduct);
}

export async function getProduct(id: string): Promise<PublicProduct | null> {
  const parsedId = ProductIdSchema.safeParse(id);
  if (!parsedId.success) return null;

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
      p.status,
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    from products p
    where p.id = ${parsedId.data}::uuid
      and p.status in ('active', 'sold_out')
    limit 1
  `;
  return rows[0] ? asPublicProduct(rows[0]) : null;
}

/**
 * Returns every product owned by this seller, including archived listings.
 * The phone-to-seller join is the ownership boundary; callers never supply a
 * seller UUID that could be swapped for another seller's id.
 */
export async function listSellerProducts(phone: string): Promise<PublicProduct[]> {
  const parsedPhone = SellerPhoneSchema.safeParse(phone);
  if (!parsedPhone.success) return [];

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
      p.status,
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    from products p
    join sellers s on s.id = p.seller_id
    where s.phone = ${parsedPhone.data}
    order by p.updated_at desc, p.created_at desc
  `;

  return rows.map(asPublicProduct);
}

/** Returns one seller-owned product, including an archived product. */
export async function getSellerProduct(
  phone: string,
  id: string,
): Promise<PublicProduct | null> {
  const parsedPhone = SellerPhoneSchema.safeParse(phone);
  const parsedId = ProductIdSchema.safeParse(id);
  if (!parsedPhone.success || !parsedId.success) return null;

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
      p.status,
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
    from products p
    join sellers s on s.id = p.seller_id
    where s.phone = ${parsedPhone.data}
      and p.id = ${parsedId.data}::uuid
    limit 1
  `;

  return rows[0] ? asPublicProduct(rows[0]) : null;
}

/**
 * Reads an image only when it belongs to the seller's own selected listing.
 * This keeps product-photo analysis private to the listing owner rather than
 * accepting a public media URL or an arbitrary image identifier.
 */
export async function getSellerProductImage(
  phone: string,
  id: string,
): Promise<StoredImage | null> {
  const parsedPhone = SellerPhoneSchema.safeParse(phone);
  const parsedId = ProductIdSchema.safeParse(id);
  if (!parsedPhone.success || !parsedId.success) return null;

  const rows = await sql<{ id: string; mime: string; bytes: Uint8Array }[]>`
    select i.id::text as id, i.mime, i.bytes
    from products p
    join sellers s on s.id = p.seller_id
    join images i on i.id = p.image_id
    where s.phone = ${parsedPhone.data}
      and p.id = ${parsedId.data}::uuid
    limit 1
  `;
  return rows[0] ?? null;
}

/**
 * Updates one seller-owned product after strict validation. A missing row,
 * different owner, malformed patch, or unknown image all return null without
 * leaking which condition failed or changing another seller's product.
 */
export async function updateSellerProduct(
  phone: string,
  id: string,
  patch: unknown,
  expectedUpdatedAt?: string,
): Promise<PublicProduct | null> {
  const parsedPhone = SellerPhoneSchema.safeParse(phone);
  const parsedId = ProductIdSchema.safeParse(id);
  const parsedPatch = SellerProductPatchSchema.safeParse(patch);
  if (!parsedPhone.success || !parsedId.success || !parsedPatch.success) return null;

  const expectedDate = expectedUpdatedAt === undefined
    ? null
    : validTimestamp(expectedUpdatedAt);
  if (expectedUpdatedAt !== undefined && expectedDate === null) return null;

  const data = parsedPatch.data;
  const hasTitle = data.title !== undefined;
  const hasDescription = data.description !== undefined;
  const hasPrice = data.price !== undefined;
  const hasQuantity = data.quantity !== undefined;
  const hasCategory = data.category !== undefined;
  const hasImageId = data.imageId !== undefined;
  const hasStatus = data.status !== undefined;
  const imageId = data.imageId ?? null;
  const hasExpectedUpdatedAt = expectedDate !== null;
  const expectedUpdatedAtValue = expectedDate ?? new Date(0);

  const rows = await sql<ProductRow[]>`
    update products p
    set
      title = case when ${hasTitle} then ${data.title ?? null} else p.title end,
      description = case when ${hasDescription} then ${data.description ?? null} else p.description end,
      price = case when ${hasPrice} then ${data.price ?? null} else p.price end,
      quantity = case when ${hasQuantity} then ${data.quantity ?? null} else p.quantity end,
      category = case when ${hasCategory} then ${data.category ?? null} else p.category end,
      image_id = case when ${hasImageId} then ${imageId}::uuid else p.image_id end,
      status = case when ${hasStatus} then ${data.status ?? null} else p.status end,
      updated_at = now()
    from sellers s
    where p.seller_id = s.id
      and s.phone = ${parsedPhone.data}
      and p.id = ${parsedId.data}::uuid
      and (
        not ${hasExpectedUpdatedAt}
        or p.updated_at = ${expectedUpdatedAtValue}
      )
      and (
        ${!hasImageId || imageId === null}
        or exists (
          select 1
          from images i
          where i.id = ${imageId}::uuid
        )
      )
    returning
      p.id::text as id,
      p.title,
      p.price,
      p.quantity,
      p.category,
      p.description,
      p.image_id::text as "imageId",
      p.seller_name as "sellerName",
      p.seller_location as "sellerLocation",
      p.status,
      p.created_at as "createdAt",
      p.updated_at as "updatedAt"
  `;

  return rows[0] ? asPublicProduct(rows[0]) : null;
}

function validTimestamp(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
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
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
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
