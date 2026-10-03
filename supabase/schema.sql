-- Advoc8 schema.
--
-- Not wired into the running app yet. The prototype stores entries in
-- localStorage through lib/local-store.js; when this schema is live, swap that
-- store for the route handlers and leave everything downstream untouched.
--
--   supabase db execute --file supabase/schema.sql

create extension if not exists "pgcrypto";

-- users mirrors auth.users. Kept as a thin profile so foreign keys stay simple.
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id          uuid primary key references public.users (id) on delete cascade,
  display_name     text not null,
  main_concern     text,
  appointment_goal text,
  appointment_date date,
  appointment_type text,
  updated_at       timestamptz not null default now()
);

-- One row per symptom logged on a given day.
create table if not exists public.symptom_entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  date             date not null,
  symptom          text not null,
  severity         smallint not null check (severity between 0 and 10),
  duration_minutes integer check (duration_minutes > 0),
  impact           text,
  notes            text,
  created_at       timestamptz not null default now()
);

create index if not exists symptom_entries_user_date_idx
  on public.symptom_entries (user_id, date);

create index if not exists symptom_entries_user_symptom_idx
  on public.symptom_entries (user_id, symptom);

-- One row per day of context. Sleep and stress are what make co-occurrence
-- analysis possible, so both are numeric and unconstrained by an enum.
create table if not exists public.context_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  date        date not null unique,
  sleep_hours numeric(3, 1) check (sleep_hours between 0 and 24),
  stress_level smallint check (stress_level between 1 and 5),
  cycle_day   smallint check (cycle_day between 1 and 45),
  cycle_phase text,
  created_at  timestamptz not null default now()
);

create index if not exists context_entries_user_date_idx
  on public.context_entries (user_id, date);

-- A snapshot of the deterministic report. The numbers are stored so a brief
-- can be reproduced exactly as it looked on the day it was generated.
create table if not exists public.evidence_briefs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  period_start    date not null,
  period_end      date not null,
  report_snapshot jsonb not null,
  statement       text,
  generated_at    timestamptz not null default now()
);

create index if not exists evidence_briefs_user_idx
  on public.evidence_briefs (user_id, generated_at desc);

create table if not exists public.questions (
  id         uuid primary key default gen_random_uuid(),
  brief_id   uuid references public.evidence_briefs (id) on delete cascade,
  user_id    uuid not null references public.users (id) on delete cascade,
  text       text not null,
  section    text,
  source     text not null default 'ai' check (source in ('ai', 'manual', 'seed')),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists questions_brief_idx on public.questions (brief_id, position);

create table if not exists public.practice_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  brief_id   uuid references public.evidence_briefs (id) on delete set null,
  transcript jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

create index if not exists practice_sessions_user_idx
  on public.practice_sessions (user_id, started_at desc);

-- Row level security: a user can only ever reach their own rows.
alter table public.users            enable row level security;
alter table public.profiles         enable row level security;
alter table public.symptom_entries  enable row level security;
alter table public.context_entries  enable row level security;
alter table public.evidence_briefs  enable row level security;
alter table public.questions        enable row level security;
alter table public.practice_sessions enable row level security;

create policy "own users" on public.users
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own profile" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own symptom entries" on public.symptom_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own context entries" on public.context_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own briefs" on public.evidence_briefs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own questions" on public.questions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own practice sessions" on public.practice_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());