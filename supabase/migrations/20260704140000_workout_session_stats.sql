alter table public.workout_sessions
  add column if not exists tonnage_kg integer default 0;
