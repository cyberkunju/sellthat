import { sql } from "./db";

// A stable, transaction-scoped lock prevents two overlapping backend starts
// from attempting the same idempotent DDL at once.
const PRODUCT_SCHEMA_MIGRATION_LOCK = 1_047_202_505;

/**
 * Brings a persistent pre-status database forward without relying on the
 * Postgres init directory (which only runs for a brand-new volume).
 */
export async function runProductSchemaMigrations(): Promise<void> {
  await sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(${PRODUCT_SCHEMA_MIGRATION_LOCK})`;

    await transaction`
      do $migration$
      begin
        if not exists (
          select 1
          from pg_attribute
          where attrelid = 'products'::regclass
            and attname = 'status'
            and not attisdropped
        ) then
          alter table products add column status text;
        end if;

        if not exists (
          select 1
          from pg_attribute
          where attrelid = 'products'::regclass
            and attname = 'updated_at'
            and not attisdropped
        ) then
          alter table products add column updated_at timestamptz;
        end if;
      end
      $migration$;
    `;
    await transaction`
      update products
      set status = 'active'
      where status is null
    `;
    await transaction`
      alter table products
      alter column status set default 'active'
    `;
    await transaction`
      alter table products
      alter column status set not null
    `;

    await transaction`
      update products
      set updated_at = created_at
      where updated_at is null
    `;
    await transaction`
      alter table products
      alter column updated_at set default now()
    `;
    await transaction`
      alter table products
      alter column updated_at set not null
    `;

    await transaction`
      do $migration$
      begin
        if not exists (
          select 1
          from pg_constraint
          where conrelid = 'products'::regclass
            and conname = 'products_status_check'
        ) then
          alter table products
            add constraint products_status_check
            check (status in ('active', 'sold_out', 'archived'));
        end if;
      end
      $migration$;
    `;

    await transaction`
      do $migration$
      begin
        if to_regclass('products_public_created_at_idx') is null then
          execute 'create index products_public_created_at_idx on products (created_at desc) where status in (''active'', ''sold_out'')';
        end if;

        if to_regclass('products_seller_updated_at_idx') is null then
          execute 'create index products_seller_updated_at_idx on products (seller_id, updated_at desc)';
        end if;
      end
      $migration$;
    `;
  });
}
