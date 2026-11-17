-- =============================================================================
-- MOVE, STEP 1 of 3: the website's tables and photo buckets on the NEW project.
--
-- Run once, in the NEW project's SQL editor, before scripts/move-database.mts.
-- Written from the live shapes of the old project (read 2026-11-17), not from
-- lib/leads/migration.sql: that file rewrites an existing `leads` table's
-- statuses and grants, which would damage another app's table of the same
-- name if this project already has one.
--
-- What the website keeps in Supabase, and nothing else:
--   used_cars        the stock (ids are the public URL numbers - keep them)
--   leads            enquiries from the site
--   lead_activities  the lead desk's timeline
--   car-photos       bucket, public, the stock photos
--   am_group_files   bucket, public, branch photography
-- =============================================================================

-- Stop if any of the three tables already exists here: this project is then
-- not empty for this purpose, and merging must be a decision, not an accident.
do $$
declare t text;
begin
  foreach t in array array['used_cars', 'leads', 'lead_activities'] loop
    if to_regclass('public.' || t) is not null then
      raise exception 'public.% already exists in this project. Nothing was changed. Check what it is before moving the website here.', t;
    end if;
  end loop;
end $$;

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- used_cars
-- -----------------------------------------------------------------------------
create sequence public.used_cars_id_seq;

create table public.used_cars (
  id             bigint primary key default nextval('public.used_cars_id_seq'),
  status         text not null default 'draft' check (status in ('draft', 'published', 'sold')),
  title          text not null,
  make           text,
  model          text,
  variant        text,
  year           integer check (year is null or year between 1980 and 2100),
  price          bigint check (price is null or price >= 0),
  original_price bigint check (original_price is null or original_price >= 0),
  mileage_km     integer check (mileage_km is null or mileage_km >= 0),
  fuel           text,
  transmission   text,
  drivetrain     text,
  body_type      text,
  colour         text,
  engine         text,
  condition      text,
  owners         integer check (owners is null or owners between 1 and 10),
  registration   text,
  location_slug  text,
  description    text,
  images         text[] not null default '{}',
  source         text not null default 'admin',
  source_url     text,
  posted_at      timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter sequence public.used_cars_id_seq owned by public.used_cars.id;
-- Cars added in the admin take ids from 100000 up. Set again in step 3, after
-- the copy, in case the old project had already issued some.
select setval('public.used_cars_id_seq', 100000, true);

create index used_cars_status_posted_idx on public.used_cars (status, posted_at desc);

create or replace function public.used_cars_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger used_cars_touch_updated_at
  before update on public.used_cars
  for each row execute function public.used_cars_touch_updated_at();

-- -----------------------------------------------------------------------------
-- leads
-- vehicle_id / dealership_id are kept for old rows; nothing references them.
-- -----------------------------------------------------------------------------
create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  customer_name     text not null,
  customer_phone    text not null,
  customer_email    text,
  vehicle_id        uuid,
  dealership_id     uuid,
  inquiry_type      text,
  message           text,
  status            text default 'New'
                    check (status in ('New', 'Contacted', 'Follow-up', 'Qualified', 'Won', 'Lost')),
  created_at        timestamptz default now(),
  intent            text,
  source_path       text,
  source_label      text,
  listing_id        bigint,
  listing_title     text,
  listing_price     bigint,
  listing_url       text,
  assigned_to       text,
  next_follow_up_at timestamptz,
  consent           boolean default false,
  updated_at        timestamptz default now()
);

create index leads_created_at_idx     on public.leads (created_at desc);
create index leads_status_idx         on public.leads (status);
create index leads_intent_idx         on public.leads (intent);
create index leads_phone_idx          on public.leads (customer_phone);
create index leads_assigned_to_idx    on public.leads (assigned_to);
create index leads_next_follow_up_idx on public.leads (next_follow_up_at) where next_follow_up_at is not null;

-- A name of its own, so it cannot replace another app's set_updated_at().
create or replace function public.website_leads_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.website_leads_touch_updated_at();

-- -----------------------------------------------------------------------------
-- lead_activities
-- -----------------------------------------------------------------------------
create table public.lead_activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  type        text not null check (type in (
                'created', 'note', 'status_change', 'call', 'whatsapp', 'email',
                'follow_up_scheduled', 'assigned')),
  body        text,
  from_status text,
  to_status   text,
  author      text,
  created_at  timestamptz default now()
);

create index lead_activities_lead_id_idx on public.lead_activities (lead_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Row level security: ON, no policies. Customers' names and phone numbers must
-- not be readable with the public anon key. The website reads and writes with
-- the service-role key, on the server only.
-- -----------------------------------------------------------------------------
alter table public.used_cars       enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_activities enable row level security;

revoke all on public.used_cars       from anon, authenticated;
revoke all on public.leads           from anon, authenticated;
revoke all on public.lead_activities from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Buckets. Public reads (the photos are on a public website); uploads go
-- through signed URLs the server issues to a signed-in admin.
-- An existing am_group_files bucket is left exactly as it is.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-photos', 'car-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('am_group_files', 'am_group_files', true)
on conflict (id) do nothing;

-- Verify:
--   select relname, relrowsecurity from pg_class where relname in ('used_cars','leads','lead_activities');
--   select id, public from storage.buckets;
