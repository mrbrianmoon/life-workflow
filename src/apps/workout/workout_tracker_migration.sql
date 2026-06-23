-- ============================================================
-- Lift Log / Workout Tracker  —  schema migration
-- Three tables: routines, exercises, sessions (history)
-- RLS on each, matching the auth.uid() = user_id pattern.
-- Safe to run once. Uses IF NOT EXISTS where possible.
-- ============================================================

-- ---------- routines ----------
create table if not exists public.workout_routines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists workout_routines_user_idx
  on public.workout_routines (user_id, position);

-- ---------- exercises ----------
create table if not exists public.workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  routine_id  uuid not null references public.workout_routines (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null default '',
  weight      text not null default '',
  sets        text not null default '',
  reps        text not null default '',
  rest        text not null default '',
  sets_done   integer not null default 0,   -- completed-set count, persists mid-workout
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists workout_exercises_routine_idx
  on public.workout_exercises (routine_id, position);

-- ---------- sessions (logged history snapshots) ----------
create table if not exists public.workout_sessions (
  id          uuid primary key default gen_random_uuid(),
  routine_id  uuid not null references public.workout_routines (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  logged_at   timestamptz not null default now(),
  volume      numeric not null default 0,
  exercises   jsonb not null default '[]'::jsonb
);

create index if not exists workout_sessions_routine_idx
  on public.workout_sessions (routine_id, logged_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.workout_routines  enable row level security;
alter table public.workout_exercises  enable row level security;
alter table public.workout_sessions   enable row level security;

-- routines
drop policy if exists "own routines select" on public.workout_routines;
create policy "own routines select" on public.workout_routines
  for select using (auth.uid() = user_id);

drop policy if exists "own routines insert" on public.workout_routines;
create policy "own routines insert" on public.workout_routines
  for insert with check (auth.uid() = user_id);

drop policy if exists "own routines update" on public.workout_routines;
create policy "own routines update" on public.workout_routines
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own routines delete" on public.workout_routines;
create policy "own routines delete" on public.workout_routines
  for delete using (auth.uid() = user_id);

-- exercises
drop policy if exists "own exercises select" on public.workout_exercises;
create policy "own exercises select" on public.workout_exercises
  for select using (auth.uid() = user_id);

drop policy if exists "own exercises insert" on public.workout_exercises;
create policy "own exercises insert" on public.workout_exercises
  for insert with check (auth.uid() = user_id);

drop policy if exists "own exercises update" on public.workout_exercises;
create policy "own exercises update" on public.workout_exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own exercises delete" on public.workout_exercises;
create policy "own exercises delete" on public.workout_exercises
  for delete using (auth.uid() = user_id);

-- sessions
drop policy if exists "own sessions select" on public.workout_sessions;
create policy "own sessions select" on public.workout_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "own sessions insert" on public.workout_sessions;
create policy "own sessions insert" on public.workout_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "own sessions delete" on public.workout_sessions;
create policy "own sessions delete" on public.workout_sessions
  for delete using (auth.uid() = user_id);
-- (no update policy on sessions: history snapshots are immutable once logged)
