-- Interactive Workout System: tracks, days, exercises + profile biometrics
alter table public.profiles
  add column if not exists age integer check (age >= 13 and age <= 100),
  add column if not exists gender varchar(10) check (gender in ('male', 'female', 'other'));

create table if not exists public.workout_tracks (
  id uuid default gen_random_uuid() primary key,
  slug varchar(40) not null unique,
  title varchar(100) not null,
  description text,
  duration_weeks integer not null default 2,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workout_days (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.workout_tracks(id) on delete cascade not null,
  week_number integer not null,
  day_number integer not null,
  focus_name varchar(100) not null,
  notes text,
  unique (track_id, week_number, day_number)
);

create table if not exists public.workout_exercises (
  id uuid default gen_random_uuid() primary key,
  day_id uuid references public.workout_days(id) on delete cascade not null,
  exercise_name varchar(120) not null,
  sets_count integer not null,
  reps_target varchar(50) not null,
  intensity_percentage integer default 70,
  rest_seconds integer default 90,
  is_cardio boolean default false,
  cardio_duration_minutes integer default 0,
  primary_muscles varchar[] not null default '{}',
  secondary_muscles varchar[] default '{}',
  sort_order integer not null default 0
);

alter table public.workout_sessions
  add column if not exists track_slug varchar(40),
  add column if not exists day_focus varchar(100),
  add column if not exists duration_minutes integer default 0,
  add column if not exists calories_burned integer default 0,
  add column if not exists xp_earned integer default 0;

alter table public.workout_tracks enable row level security;
alter table public.workout_days enable row level security;
alter table public.workout_exercises enable row level security;

drop policy if exists "Public read workout tracks" on public.workout_tracks;
create policy "Public read workout tracks" on public.workout_tracks for select using (true);

drop policy if exists "Public read workout days" on public.workout_days;
create policy "Public read workout days" on public.workout_days for select using (true);

drop policy if exists "Public read workout exercises" on public.workout_exercises;
create policy "Public read workout exercises" on public.workout_exercises for select using (true);
