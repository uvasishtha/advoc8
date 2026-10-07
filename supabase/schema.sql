-- Advoc8 schema.
--
-- This file mirrors the live Supabase database. It is the source of truth for
-- the schema; do not run it again unless you want to recreate the tables.
--
--   supabase db execute --file supabase/schema.sql

create extension if not exists "pgcrypto";

-- One row per user. Mirrors auth.users so foreign keys stay simple.
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- Rich profile data: setup answers and display name.
create table if not exists public.profiles (
  id               uuid primary key references public.users (id) on delete cascade,
  name             text,
  onboarding_data  jsonb,
  onboarding_status text,
  completed_at     timestamptz,
  skipped_at       timestamptz,
  source           text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- One row per symptom logged on a given day.
create table if not exists public.symptoms (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  date             date not null,
  symptom          text not null,
  severity         smallint check (severity between 0 and 10),
  duration         integer,
  notes            text,
  impact           text,
  created_at       timestamptz not null default now()
);

create index if not exists symptoms_user_date_idx
  on public.symptoms (user_id, date);

-- One row per day of context. Sleep and stress make co-occurrence analysis
-- possible, so both are numeric and unconstrained by an enum.
create table if not exists public.context_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  date        date not null,
  sleep       numeric(3, 1) check (sleep between 0 and 24),
  stress      smallint check (stress between 1 and 5),
  cycle_phase text,
  notes       text,
  created_at  timestamptz not null default now()
);

drop index if exists context_entries_date_key;
drop index if exists context_entries_user_date_idx;

create unique index if not exists context_entries_user_date_idx
  on public.context_entries (user_id, date);

-- The brief draft: the user's own statement and their question list.
create table if not exists public.brief_drafts (
  user_id    uuid primary key references public.users (id) on delete cascade,
  statement  text,
  questions  jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row level security: a user can only ever reach their own rows.
alter table public.users           enable row level security;
alter table public.profiles        enable row level security;
alter table public.symptoms         enable row level security;
alter table public.context_entries  enable row level security;
alter table public.brief_drafts     enable row level security;

create policy "own users" on public.users
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own symptoms" on public.symptoms
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own context" on public.context_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own brief" on public.brief_drafts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());