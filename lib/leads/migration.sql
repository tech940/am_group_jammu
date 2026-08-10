-- =============================================================================
-- AM Group — leads & follow-up schema
-- Idempotent: safe to run on a fresh database or over the existing `leads`
-- table from lib/schema.sql.
-- Run in the Supabase SQL editor.
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. Base table (no-op if lib/schema.sql was already applied) ----------------
create table if not exists leads (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    vehicle_id uuid,
    dealership_id uuid,
    inquiry_type text,
    message text,
    status text default 'New',
    created_at timestamptz default now()
);

-- 2. Columns the lead desk actually needs ------------------------------------
alter table leads add column if not exists intent            text;
alter table leads add column if not exists source_path       text;
alter table leads add column if not exists source_label      text;
alter table leads add column if not exists listing_id        bigint;
alter table leads add column if not exists listing_title     text;
alter table leads add column if not exists listing_price     bigint;
alter table leads add column if not exists listing_url       text;
alter table leads add column if not exists assigned_to       text;
alter table leads add column if not exists next_follow_up_at timestamptz;
alter table leads add column if not exists consent           boolean default false;
alter table leads add column if not exists updated_at        timestamptz default now();

-- Backfill intent from the legacy free-text column, then keep them in sync.
update leads set intent = coalesce(intent, inquiry_type, 'General') where intent is null;

-- Constrain the status vocabulary. Previously any string was accepted, so the
-- UI and the schema had drifted apart ("Hot Lead" vs "Lost").
update leads set status = 'New' where status is null
   or status not in ('New','Contacted','Follow-up','Qualified','Won','Lost');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_status_check') then
    alter table leads add constraint leads_status_check
      check (status in ('New','Contacted','Follow-up','Qualified','Won','Lost'));
  end if;
end $$;

-- 3. Activity timeline -------------------------------------------------------
create table if not exists lead_activities (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references leads(id) on delete cascade,
    type text not null check (type in (
      'created','note','status_change','call','whatsapp','email',
      'follow_up_scheduled','assigned'
    )),
    body text,
    from_status text,
    to_status text,
    author text,
    created_at timestamptz default now()
);

-- 4. Indexes -----------------------------------------------------------------
-- Every admin filter was previously a sequential scan.
create index if not exists leads_created_at_idx        on leads (created_at desc);
create index if not exists leads_status_idx            on leads (status);
create index if not exists leads_intent_idx            on leads (intent);
create index if not exists leads_phone_idx             on leads (customer_phone);
create index if not exists leads_assigned_to_idx       on leads (assigned_to);
create index if not exists leads_next_follow_up_idx    on leads (next_follow_up_at)
  where next_follow_up_at is not null;
create index if not exists lead_activities_lead_id_idx on lead_activities (lead_id, created_at desc);

-- 5. Keep updated_at honest --------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- 6. Row Level Security ------------------------------------------------------
-- CRITICAL. Without this, the public NEXT_PUBLIC anon key can read every
-- customer's name, phone and email straight from the internet, bypassing the
-- app entirely. The app writes leads through the service-role key on the
-- server, so the anon role needs NO access at all.
alter table leads            enable row level security;
alter table lead_activities  enable row level security;

drop policy if exists "leads: no anon access"      on leads;
drop policy if exists "activities: no anon access" on lead_activities;

-- Deliberately no permissive policy: with RLS on and no policy, the anon and
-- authenticated roles get nothing. service_role bypasses RLS by design.
revoke all on leads           from anon, authenticated;
revoke all on lead_activities from anon, authenticated;

-- =============================================================================
-- Verify:
--   select column_name from information_schema.columns where table_name='leads';
--   select relrowsecurity from pg_class where relname='leads';   -- expect true
-- =============================================================================
