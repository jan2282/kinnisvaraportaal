-- Kodu — Eesti kinnisvaraportaal
-- Esialgne andmebaasi skeem: tabelid, enumid, RLS, triggerid, storage, realtime.

-- ============================================================
--  EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
--  ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('buyer', 'seller', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_type as enum ('apartment', 'house', 'land', 'commercial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_condition as enum ('new', 'renovated', 'good', 'needs_renovation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('draft', 'active', 'under_offer', 'sold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type offer_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum ('open', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type viewing_status as enum ('pending', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('requested', 'confirmed', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type energy_class as enum ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');
exception when duplicate_object then null; end $$;

-- ============================================================
--  HELPER: updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
--  PROFILES (laiendab auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'both',
  created_at  timestamptz not null default now()
);

-- ============================================================
--  LISTINGS
-- ============================================================
create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  description   text,
  address       text,
  city          text,
  parish        text,
  county        text,
  price         integer,
  size_m2       numeric(8,2),
  rooms         integer,
  floor         integer,
  floors_total  integer,
  year_built    integer,
  type          listing_type not null,
  condition     listing_condition,
  has_debt      boolean not null default false,
  has_co_owners boolean not null default false,
  has_tenants   boolean not null default false,
  energy_class  energy_class,
  status        listing_status not null default 'draft',
  views         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_city_idx on public.listings(city);
create index if not exists listings_type_idx on public.listings(type);
create index if not exists listings_seller_idx on public.listings(seller_id);
create index if not exists listings_price_idx on public.listings(price);
create index if not exists listings_created_idx on public.listings(created_at desc);

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ============================================================
--  LISTING IMAGES
-- ============================================================
create table if not exists public.listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  url         text not null,
  order_index integer not null default 0,
  is_cover    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists listing_images_listing_idx on public.listing_images(listing_id);

-- ============================================================
--  LISTING FEATURES
-- ============================================================
create table if not exists public.listing_features (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  feature     text not null
);

create index if not exists listing_features_listing_idx on public.listing_features(listing_id);

-- ============================================================
--  INQUIRIES
-- ============================================================
create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  message     text,
  status      inquiry_status not null default 'open',
  created_at  timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create index if not exists inquiries_buyer_idx on public.inquiries(buyer_id);
create index if not exists inquiries_seller_idx on public.inquiries(seller_id);
create index if not exists inquiries_listing_idx on public.inquiries(listing_id);

-- ============================================================
--  MESSAGES
-- ============================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid not null references public.inquiries(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists messages_inquiry_idx on public.messages(inquiry_id);
create index if not exists messages_created_idx on public.messages(created_at);

-- ============================================================
--  OFFERS
-- ============================================================
create table if not exists public.offers (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null references public.listings(id) on delete cascade,
  buyer_id         uuid not null references public.profiles(id) on delete cascade,
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  amount           integer not null,
  message          text,
  status           offer_status not null default 'pending',
  closing_progress jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists offers_listing_idx on public.offers(listing_id);
create index if not exists offers_buyer_idx on public.offers(buyer_id);
create index if not exists offers_seller_idx on public.offers(seller_id);

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- ============================================================
--  VIEWINGS
-- ============================================================
create table if not exists public.viewings (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings(id) on delete cascade,
  buyer_id      uuid not null references public.profiles(id) on delete cascade,
  seller_id     uuid not null references public.profiles(id) on delete cascade,
  proposed_date date,
  proposed_time text,
  status        viewing_status not null default 'pending',
  created_at    timestamptz not null default now()
);

create index if not exists viewings_listing_idx on public.viewings(listing_id);
create index if not exists viewings_buyer_idx on public.viewings(buyer_id);
create index if not exists viewings_seller_idx on public.viewings(seller_id);

-- ============================================================
--  PHOTOGRAPHER BOOKINGS
-- ============================================================
create table if not exists public.photographer_bookings (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references public.listings(id) on delete set null,
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  name            text,
  address         text,
  preferred_dates text[],
  preferred_time  text,
  notes           text,
  status          booking_status not null default 'requested',
  created_at      timestamptz not null default now()
);

create index if not exists photographer_bookings_seller_idx on public.photographer_bookings(seller_id);

-- ============================================================
--  SAVED LISTINGS (lemmikud)
-- ============================================================
create table if not exists public.saved_listings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists saved_listings_user_idx on public.saved_listings(user_id);

-- ============================================================
--  AUTH TRIGGER: loo profiil uue kasutaja registreerimisel
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'both')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles              enable row level security;
alter table public.listings              enable row level security;
alter table public.listing_images        enable row level security;
alter table public.listing_features      enable row level security;
alter table public.inquiries             enable row level security;
alter table public.messages              enable row level security;
alter table public.offers                enable row level security;
alter table public.viewings              enable row level security;
alter table public.photographer_bookings enable row level security;
alter table public.saved_listings        enable row level security;

-- ---- PROFILES ----
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---- LISTINGS ----
drop policy if exists "listings_select_public_or_own" on public.listings;
create policy "listings_select_public_or_own" on public.listings
  for select using (status = 'active' or seller_id = auth.uid());

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own" on public.listings
  for insert with check (seller_id = auth.uid());

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own" on public.listings
  for update using (seller_id = auth.uid());

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own" on public.listings
  for delete using (seller_id = auth.uid());

-- ---- LISTING IMAGES ----
drop policy if exists "listing_images_select" on public.listing_images;
create policy "listing_images_select" on public.listing_images
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

drop policy if exists "listing_images_modify_own" on public.listing_images;
create policy "listing_images_modify_own" on public.listing_images
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  ) with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

-- ---- LISTING FEATURES ----
drop policy if exists "listing_features_select" on public.listing_features;
create policy "listing_features_select" on public.listing_features
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.seller_id = auth.uid())
    )
  );

drop policy if exists "listing_features_modify_own" on public.listing_features;
create policy "listing_features_modify_own" on public.listing_features
  for all using (
    exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  ) with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

-- ---- INQUIRIES ----
drop policy if exists "inquiries_select_participants" on public.inquiries;
create policy "inquiries_select_participants" on public.inquiries
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "inquiries_insert_buyer" on public.inquiries;
create policy "inquiries_insert_buyer" on public.inquiries
  for insert with check (buyer_id = auth.uid());

drop policy if exists "inquiries_update_participants" on public.inquiries;
create policy "inquiries_update_participants" on public.inquiries
  for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- ---- MESSAGES ----
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
  for select using (
    exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id
        and (i.buyer_id = auth.uid() or i.seller_id = auth.uid())
    )
  );

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id
        and (i.buyer_id = auth.uid() or i.seller_id = auth.uid())
    )
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant" on public.messages
  for update using (
    exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id
        and (i.buyer_id = auth.uid() or i.seller_id = auth.uid())
    )
  );

-- ---- OFFERS ----
drop policy if exists "offers_select_participants" on public.offers;
create policy "offers_select_participants" on public.offers
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "offers_insert_buyer" on public.offers;
create policy "offers_insert_buyer" on public.offers
  for insert with check (buyer_id = auth.uid());

drop policy if exists "offers_update_participants" on public.offers;
create policy "offers_update_participants" on public.offers
  for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- ---- VIEWINGS ----
drop policy if exists "viewings_select_participants" on public.viewings;
create policy "viewings_select_participants" on public.viewings
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "viewings_insert_buyer" on public.viewings;
create policy "viewings_insert_buyer" on public.viewings
  for insert with check (buyer_id = auth.uid());

drop policy if exists "viewings_update_participants" on public.viewings;
create policy "viewings_update_participants" on public.viewings
  for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- ---- PHOTOGRAPHER BOOKINGS ----
drop policy if exists "bookings_all_own" on public.photographer_bookings;
create policy "bookings_all_own" on public.photographer_bookings
  for all using (seller_id = auth.uid()) with check (seller_id = auth.uid());

-- ---- SAVED LISTINGS ----
drop policy if exists "saved_all_own" on public.saved_listings;
create policy "saved_all_own" on public.saved_listings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
--  STORAGE BUCKETS + POLICIES
-- ============================================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- listing-images: avalik lugemine, autenditud kasutaja saab oma kausta laadida
drop policy if exists "listing_images_public_read" on storage.objects;
create policy "listing_images_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "listing_images_auth_insert" on storage.objects;
create policy "listing_images_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listing_images_auth_update" on storage.objects;
create policy "listing_images_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listing_images_auth_delete" on storage.objects;
create policy "listing_images_auth_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- avatars: avalik lugemine, kasutaja oma kausta
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_auth_write" on storage.objects;
create policy "avatars_auth_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
--  REALTIME PUBLICATION
-- ============================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.messages;
    exception when duplicate_object then null; end;
    begin
      alter publication supabase_realtime add table public.offers;
    exception when duplicate_object then null; end;
    begin
      alter publication supabase_realtime add table public.inquiries;
    exception when duplicate_object then null; end;
    begin
      alter publication supabase_realtime add table public.viewings;
    exception when duplicate_object then null; end;
  end if;
end $$;
