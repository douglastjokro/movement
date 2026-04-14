-- Run this once in the Supabase SQL Editor (Project → SQL → New query).
-- It creates a single table that stores each user's full workout JSON blob,
-- with row-level security so each user only sees their own row.

create table if not exists public.workout_data (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.workout_data enable row level security;

drop policy if exists "users manage own workout_data" on public.workout_data;
create policy "users manage own workout_data"
  on public.workout_data
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
