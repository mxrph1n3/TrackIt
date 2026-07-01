-- Dashboard metrics: habits, logs, workouts, nutrition + task due_date

alter table public.tasks
  add column if not exists due_date date default (timezone('utc', now()))::date;

update public.tasks
set due_date = (created_at at time zone 'utc')::date
where due_date is null;

create index if not exists tasks_user_due_date_idx
  on public.tasks (user_id, due_date);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  days_of_week integer[] not null default array[0,1,2,3,4,5,6],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists habits_user_active_idx
  on public.habits (user_id, is_active);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null default (timezone('utc', now()))::date,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  constraint habit_logs_unique_day unique (habit_id, logged_on)
);

create index if not exists habit_logs_user_day_idx
  on public.habit_logs (user_id, logged_on);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null default (timezone('utc', now()))::date,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint workout_sessions_user_day unique (user_id, session_date)
);

create index if not exists workout_sessions_user_day_idx
  on public.workout_sessions (user_id, session_date);

create table if not exists public.daily_nutrition_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default (timezone('utc', now()))::date,
  calories_consumed numeric(8, 2) not null default 0 check (calories_consumed >= 0),
  calorie_target numeric(8, 2) not null default 1700 check (calorie_target > 0),
  updated_at timestamptz not null default now(),
  constraint daily_nutrition_logs_user_day unique (user_id, log_date)
);

create index if not exists daily_nutrition_logs_user_day_idx
  on public.daily_nutrition_logs (user_id, log_date);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.daily_nutrition_logs enable row level security;

drop policy if exists "Users manage own habits" on public.habits;
create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own habit logs" on public.habit_logs;
create policy "Users manage own habit logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own workout sessions" on public.workout_sessions;
create policy "Users manage own workout sessions"
  on public.workout_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own daily nutrition logs" on public.daily_nutrition_logs;
create policy "Users manage own daily nutrition logs"
  on public.daily_nutrition_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, update, delete on public.habit_logs to authenticated;
grant select, insert, update, delete on public.workout_sessions to authenticated;
grant select, insert, update, delete on public.daily_nutrition_logs to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.habit_logs;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.workout_sessions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.daily_nutrition_logs;
exception when duplicate_object then null;
end $$;
