-- Used-car stock for the public website.
--
-- A NEW table. This database is shared with another application whose
-- `vehicles` / `vehicle_inventory` tables are a workshop workflow, not a
-- catalogue; nothing here touches them.
--
-- Safe to run more than once.

create sequence if not exists public.used_cars_id_seq;

create table if not exists public.used_cars (
  -- Imported cars keep their WordPress listing id, because that number is in
  -- every public URL (…-5579), in the Meta catalogue (vehicle_id) and on past
  -- leads (leads.listing_id). Cars added in the admin take ids from 100000 up,
  -- which can never collide with an imported one.
  id            bigint primary key default nextval('public.used_cars_id_seq'),

  -- draft: saved, not on the site. published: on the site and in the feed.
  -- sold: off the site and the feed, kept for the record.
  status        text not null default 'draft'
                check (status in ('draft', 'published', 'sold')),

  -- Make and model as shown to buyers, without the year: "Hyundai i20".
  title         text not null,
  make          text,
  model         text,
  variant       text,
  year          integer check (year is null or year between 1980 and 2100),

  -- Rupees. `price` is the asking price; `original_price` is the higher figure
  -- shown struck through, when there is one.
  price         bigint check (price is null or price >= 0),
  original_price bigint check (original_price is null or original_price >= 0),

  mileage_km    integer check (mileage_km is null or mileage_km >= 0),
  fuel          text,
  transmission  text,
  drivetrain    text,
  body_type     text,
  colour        text,
  engine        text,
  -- "Certified Used" / "Used Cars".
  condition     text,
  owners        integer check (owners is null or owners between 1 and 10),
  -- Registration series only, e.g. "JK02". Never the full plate.
  registration  text,
  -- Which site the car is at: a slug from lib/locations.ts.
  location_slug text,
  description   text,

  -- Public photo URLs, in display order. The first is the cover.
  images        text[] not null default '{}',

  -- 'wordpress' for imported cars, 'admin' for cars added in the admin.
  source        text not null default 'admin',
  -- The car's old WordPress address, so old links keep redirecting to it.
  source_url    text,

  posted_at     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter sequence public.used_cars_id_seq owned by public.used_cars.id;
select setval('public.used_cars_id_seq', greatest(100000, (select coalesce(max(id), 0) from public.used_cars)), true);

create index if not exists used_cars_status_posted_idx
  on public.used_cars (status, posted_at desc);

create or replace function public.used_cars_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists used_cars_touch_updated_at on public.used_cars;
create trigger used_cars_touch_updated_at
  before update on public.used_cars
  for each row execute function public.used_cars_touch_updated_at();

-- Row level security ON with NO policies: the anon key can neither read nor
-- write. The website reads and writes with the service-role key, on the
-- server only, behind the admin session check.
alter table public.used_cars enable row level security;

-- Photos. A public bucket (the photos are shown on a public website); writes
-- go through signed upload URLs issued by the server to a signed-in admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-photos', 'car-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
