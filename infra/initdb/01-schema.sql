create extension if not exists pgcrypto;

create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  location text,
  language text not null default 'en-IN' check (language in ('en-IN', 'hi-IN', 'bn-IN', 'te-IN', 'mr-IN', 'ta-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN')),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  mime text not null,
  bytes bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text not null default '',
  price integer not null check (price >= 0),
  quantity integer not null default 1 check (quantity >= 1),
  category text not null default 'General',
  image_id uuid references images(id),
  seller_name text,
  seller_location text,
  language text check (language is null or language in ('en-IN', 'hi-IN', 'bn-IN', 'te-IN', 'mr-IN', 'ta-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN')),
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on products (created_at desc);

create table if not exists sessions (
  phone text primary key,
  stage text not null default 'new' check (stage in ('new', 'lang', 'role', 'verify_gate', 'selling', 'done')),
  language text check (language is null or language in ('en-IN', 'hi-IN', 'bn-IN', 'te-IN', 'mr-IN', 'ta-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN')),
  role text check (role is null or role in ('seller', 'buyer')),
  draft jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- A deterministic fallback keeps a fresh marketplace useful for demos before
-- the first verified WhatsApp seller publishes a listing.
insert into sellers (phone, name, location, language, is_verified)
values ('seed:demo-seller', 'SellThat Demo Seller', 'Bengaluru', 'en-IN', true)
on conflict (phone) do update
  set name = excluded.name,
      location = excluded.location,
      language = excluded.language,
      is_verified = excluded.is_verified,
      updated_at = now();

insert into products (
  seller_id,
  title,
  description,
  price,
  quantity,
  category,
  seller_name,
  seller_location,
  language
)
select
  seller.id,
  'Handwoven Cotton Tote Bag',
  'A sturdy everyday tote handwoven by a local seller.',
  499,
  5,
  'Bags',
  seller.name,
  seller.location,
  seller.language
from sellers as seller
where seller.phone = 'seed:demo-seller'
  and not exists (
    select 1
    from products
    where seller_id = seller.id
      and title = 'Handwoven Cotton Tote Bag'
  );
