-- TrackIt schema restore (SAFE re-run)
-- When warning appears: click "Run without RLS"

begin;

drop view if exists public.leaderboard cascade;
drop view if exists public.public_profiles cascade;


-- ============================================================
-- FILE: 20260626214500_init_rpg_schema.sql
-- ============================================================

-- TrackIt2 Core RPG Profile Schema
-- Applied via Supabase CLI on 2026-06-26

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  days_active integer not null default 1 check (days_active >= 0),
  focus_hours numeric(10, 2) not null default 0.0 check (focus_hours >= 0),
  habits_count integer not null default 0 check (habits_count >= 0),
  updated_at timestamptz not null default now(),
  constraint profiles_username_unique unique (username)
);

alter table public.profiles
  alter column level set default 1,
  alter column xp set default 0,
  alter column days_active set default 1,
  alter column habits_count set default 0;

-- Leaderboard / public_profiles depend on focus_hours — drop before type change.
drop view if exists public.leaderboard cascade;
drop view if exists public.public_profiles cascade;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'focus_hours'
      and data_type <> 'numeric'
  ) then
    alter table public.profiles
      alter column focus_hours type numeric(10, 2) using focus_hours::numeric(10, 2);
  end if;
end $$;

alter table public.profiles
  alter column focus_hours set default 0.0;

alter table public.profiles
  alter column updated_at set default now();

create index if not exists profiles_xp_desc_idx
  on public.profiles (xp desc, level desc);

create index if not exists profiles_level_idx
  on public.profiles (level desc);

create or replace view public.leaderboard
with (security_invoker = true)
as
select
  p.id,
  p.username,
  p.level,
  p.xp,
  p.days_active,
  p.focus_hours,
  p.habits_count,
  rank() over (
    order by p.xp desc, p.level desc, p.updated_at asc
  )::integer as rank_position
from public.profiles p;

create or replace function public.slugify_username(raw_value text)
returns text
language sql
immutable
as $$
  select lower(
    regexp_replace(
      coalesce(nullif(trim(raw_value), ''), 'user'),
      '[^a-z0-9_]',
      '_',
      'g'
    )
  );
$$;

create or replace function public.resolve_new_username(new_user auth.users)
returns text
language plpgsql
stable
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 0;
begin
  base_username := public.slugify_username(
    coalesce(
      new_user.raw_user_meta_data ->> 'username',
      new_user.raw_user_meta_data ->> 'preferred_username',
      new_user.raw_user_meta_data ->> 'full_name',
      new_user.raw_user_meta_data ->> 'name',
      new_user.raw_user_meta_data ->> 'given_name',
      case
        when new_user.email is not null and position('@' in new_user.email) > 0
          then split_part(new_user.email, '@', 1)
        else null
      end,
      'user_' || left(replace(new_user.id::text, '-', ''), 8)
    )
  );

  candidate := base_username;

  while exists (
    select 1
    from public.profiles p
    where p.username = candidate
  ) loop
    suffix := suffix + 1;
    candidate := base_username || '_' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := public.resolve_new_username(new);

  insert into public.profiles (id, username)
  values (new.id, v_username)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

create or replace function public.award_xp_and_check_level(
  user_id uuid,
  xp_amount integer
)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_xp integer;
  v_required integer;
  v_leveled_up boolean := false;
begin
  if xp_amount is null or xp_amount <= 0 then
    raise exception 'xp_amount must be a positive integer';
  end if;

  if auth.uid() is distinct from user_id then
    raise exception 'not authorized to award XP for this user';
  end if;

  select p.level, p.xp
  into v_level, v_xp
  from public.profiles p
  where p.id = user_id
  for update;

  if not found then
    raise exception 'profile not found for user_id %', user_id;
  end if;

  v_xp := v_xp + xp_amount;

  loop
    v_required := v_level * 1000;
    exit when v_xp < v_required;

    v_xp := v_xp - v_required;
    v_level := v_level + 1;
    v_leveled_up := true;
  end loop;

  update public.profiles
  set
    level = v_level,
    xp = v_xp,
    updated_at = now()
  where id = user_id;

  return query
  select v_leveled_up, v_level, v_xp;
end;
$$;

revoke all on function public.award_xp_and_check_level(uuid, integer) from public;
grant execute on function public.award_xp_and_check_level(uuid, integer) to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Profiles block direct xp level writes" on public.profiles;
drop policy if exists "Users can update safe profile fields" on public.profiles;
create policy "Users can update safe profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and level is not distinct from (
      select p.level from public.profiles p where p.id = auth.uid()
    )
    and xp is not distinct from (
      select p.xp from public.profiles p where p.id = auth.uid()
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception
  when duplicate_object then
    null;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
grant insert, update on public.profiles to authenticated;


-- ============================================================
-- FILE: 20260626220000_quick_action_tables.sql
-- ============================================================

-- Quick Action tables: tasks, transactions, water_logs
-- Safe to re-run.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  is_today boolean not null default true,
  scheduled_time text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_created_idx
  on public.tasks (user_id, created_at desc);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_created_idx
  on public.transactions (user_id, created_at desc);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz not null default now()
);

create index if not exists water_logs_user_logged_idx
  on public.water_logs (user_id, logged_at desc);

alter table public.tasks enable row level security;
alter table public.transactions enable row level security;
alter table public.water_logs enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own water logs" on public.water_logs;
create policy "Users manage own water logs"
  on public.water_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.water_logs to authenticated;


-- ============================================================
-- FILE: 20260626230000_nutrition_workout_catalog.sql
-- ============================================================

-- Nutrition & workout catalog tables for TrackIt production seed data

create table if not exists public.ingredients (
  id text primary key,
  name text not null,
  protein_per_100g numeric(6, 2) not null default 0,
  fat_per_100g numeric(6, 2) not null default 0,
  carbs_per_100g numeric(6, 2) not null default 0,
  calories_per_100g numeric(6, 2) not null default 0,
  unit text not null default 'g'
);

create table if not exists public.meals (
  meal_id text primary key,
  name text not null,
  category text not null check (category in ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine text not null default 'european',
  tier text not null default 'mid' check (tier in ('cheap', 'mid', 'premium')),
  calories integer not null,
  protein numeric(6, 2) not null,
  fat numeric(6, 2) not null,
  carbs numeric(6, 2) not null,
  goal_tags text[] not null default '{}',
  prep_time integer not null default 15,
  swap_ids text[] not null default '{}'
);

create table if not exists public.meal_ingredients (
  meal_id text not null references public.meals (meal_id) on delete cascade,
  ingredient_id text not null references public.ingredients (id) on delete restrict,
  grams numeric(8, 2) not null check (grams > 0),
  primary key (meal_id, ingredient_id)
);

create table if not exists public.workout_plans (
  id text primary key,
  name text not null,
  goal text not null check (goal in ('fat_loss', 'mass_gain', 'strength', 'maintenance')),
  duration_weeks integer not null check (duration_weeks > 0),
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  description text,
  days_per_week integer not null default 3
);

create table if not exists public.workout_plan_slots (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.workout_plans (id) on delete cascade,
  day_index integer not null check (day_index between 0 and 6),
  day_label text not null,
  split_name text not null,
  is_rest boolean not null default false,
  sort_order integer not null default 0,
  unique (plan_id, day_index)
);

create table if not exists public.workout_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.workout_plan_slots (id) on delete cascade,
  exercise_name text not null,
  sets integer not null default 3 check (sets > 0),
  reps_min integer not null default 8,
  reps_max integer not null default 12,
  rest_seconds integer not null default 90,
  sort_order integer not null default 0
);

create index if not exists meal_ingredients_meal_idx on public.meal_ingredients (meal_id);
create index if not exists workout_plan_slots_plan_idx on public.workout_plan_slots (plan_id);
create index if not exists workout_plan_exercises_slot_idx on public.workout_plan_exercises (slot_id);

alter table public.ingredients enable row level security;
alter table public.meals enable row level security;
alter table public.meal_ingredients enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_plan_slots enable row level security;
alter table public.workout_plan_exercises enable row level security;

drop policy if exists "Catalog ingredients are readable by everyone" on public.ingredients;
create policy "Catalog ingredients are readable by everyone"
  on public.ingredients for select using (true);

drop policy if exists "Catalog meals are readable by everyone" on public.meals;
create policy "Catalog meals are readable by everyone"
  on public.meals for select using (true);

drop policy if exists "Catalog meal ingredients are readable by everyone" on public.meal_ingredients;
create policy "Catalog meal ingredients are readable by everyone"
  on public.meal_ingredients for select using (true);

drop policy if exists "Catalog workout plans are readable by everyone" on public.workout_plans;
create policy "Catalog workout plans are readable by everyone"
  on public.workout_plans for select using (true);

drop policy if exists "Catalog workout plan slots are readable by everyone" on public.workout_plan_slots;
create policy "Catalog workout plan slots are readable by everyone"
  on public.workout_plan_slots for select using (true);

drop policy if exists "Catalog workout plan exercises are readable by everyone" on public.workout_plan_exercises;
create policy "Catalog workout plan exercises are readable by everyone"
  on public.workout_plan_exercises for select using (true);

grant select on public.ingredients to anon, authenticated;
grant select on public.meals to anon, authenticated;
grant select on public.meal_ingredients to anon, authenticated;
grant select on public.workout_plans to anon, authenticated;
grant select on public.workout_plan_slots to anon, authenticated;
grant select on public.workout_plan_exercises to anon, authenticated;


-- ============================================================
-- FILE: 20260627000000_clean_start_ranks.sql
-- ============================================================

-- Clean-start registration + server-side level tier ranks
-- Safe to re-run in Supabase SQL Editor or via `supabase db push`

-- ---------------------------------------------------------------------------
-- 1. profiles table (zero-state defaults for new RPG Life OS accounts)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  days_active integer not null default 1 check (days_active >= 0),
  focus_hours numeric(10, 2) not null default 0.0 check (focus_hours >= 0),
  habits_count integer not null default 0 check (habits_count >= 0),
  updated_at timestamptz not null default now(),
  constraint profiles_username_unique unique (username)
);

alter table public.profiles
  alter column level set default 1,
  alter column xp set default 0,
  alter column days_active set default 1,
  alter column habits_count set default 0,
  alter column focus_hours set default 0.0,
  alter column updated_at set default now();

-- ---------------------------------------------------------------------------
-- 2. Level-based performance tier (server-side rank coordinate system)
--    D: 1–9 | C: 10–19 | B: 20–29 | A: 30–44 | S: 45–59 | SS: 60+
-- ---------------------------------------------------------------------------
create or replace function public.get_user_tier(user_level integer)
returns text
language plpgsql
immutable
set search_path = public
as $$
begin
  if user_level between 1 and 9 then
    return 'D';
  elsif user_level between 10 and 19 then
    return 'C';
  elsif user_level between 20 and 29 then
    return 'B';
  elsif user_level between 30 and 44 then
    return 'A';
  elsif user_level between 45 and 59 then
    return 'S';
  elsif user_level >= 60 then
    return 'SS';
  else
    return 'D';
  end if;
end;
$$;

create or replace function public.get_user_tier_label(user_level integer)
returns text
language sql
immutable
as $$
  select public.get_user_tier(user_level) || '-Tier';
$$;

grant execute on function public.get_user_tier(integer) to anon, authenticated;
grant execute on function public.get_user_tier_label(integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Username resolver (OAuth / email fallbacks — collision-safe)
-- ---------------------------------------------------------------------------
create or replace function public.slugify_username(raw_value text)
returns text
language sql
immutable
as $$
  select lower(
    regexp_replace(
      coalesce(nullif(trim(raw_value), ''), 'user'),
      '[^a-z0-9_]',
      '_',
      'g'
    )
  );
$$;

create or replace function public.resolve_new_username(new_user auth.users)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 0;
begin
  base_username := public.slugify_username(
    coalesce(
      new_user.raw_user_meta_data ->> 'username',
      new_user.raw_user_meta_data ->> 'preferred_username',
      new_user.raw_user_meta_data ->> 'full_name',
      new_user.raw_user_meta_data ->> 'name',
      new_user.raw_user_meta_data ->> 'given_name',
      case
        when new_user.email is not null and position('@' in new_user.email) > 0
          then split_part(new_user.email, '@', 1)
        else null
      end,
      'user_' || left(replace(new_user.id::text, '-', ''), 8)
    )
  );

  candidate := base_username;

  while exists (
    select 1 from public.profiles p where p.username = candidate
  ) loop
    suffix := suffix + 1;
    candidate := base_username || '_' || suffix::text;
  end loop;

  return candidate;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Zero-state registration trigger (clean start: L1 / 0 XP)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_setup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := public.resolve_new_username(new);

  insert into public.profiles (
    id,
    username,
    level,
    xp,
    days_active,
    focus_hours,
    habits_count
  )
  values (
    new.id,
    v_username,
    1,
    0,
    1,
    0.0,
    0
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_registered on auth.users;
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_registered
  after insert on auth.users
  for each row
  execute function public.handle_new_user_setup();

-- ---------------------------------------------------------------------------
-- 5. Leaderboard view — global rank + server tier coordinate
-- ---------------------------------------------------------------------------
drop view if exists public.leaderboard;

create view public.leaderboard
with (security_invoker = true)
as
select
  p.id,
  p.username,
  p.level,
  p.xp,
  p.days_active,
  p.focus_hours,
  p.habits_count,
  public.get_user_tier(p.level) as performance_tier,
  public.get_user_tier_label(p.level) as performance_tier_label,
  rank() over (
    order by p.xp desc, p.level desc, p.updated_at asc
  )::integer as rank_position
from public.profiles p;

grant select on public.leaderboard to anon, authenticated;


-- ============================================================
-- FILE: 20260627120000_journal_entries.sql
-- ============================================================

-- Planner journal entries (one note per user per day)
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_key text not null check (day_key ~ '^\d{4}-\d{2}-\d{2}$'),
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_entries_user_day_unique unique (user_id, day_key)
);

create index if not exists journal_entries_user_day_idx
  on public.journal_entries (user_id, day_key desc);

alter table public.journal_entries enable row level security;

drop policy if exists "Users manage own journal entries" on public.journal_entries;
create policy "Users manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.journal_entries to authenticated;

create or replace function public.set_journal_entries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_journal_entries_updated_at();


-- ============================================================
-- FILE: 20260628000000_rpg_progression_v2.sql
-- ============================================================

-- RPG Progression v2: Linear-quadratic XP scaling + Solo Leveling rank tiers
-- Formula: XP_required = 500 + (level × 150)
-- Ranks: D 1-10, C 11-25, B 26-45, A 46-70, S 71-95, SS 96+

-- Optional persisted rank cache (computed on write; UI may also derive from level)
alter table public.profiles
  add column if not exists current_rank varchar(2) default 'D';

-- ---------------------------------------------------------------------------
-- Rank from level (server source of truth)
-- ---------------------------------------------------------------------------
create or replace function public.get_user_tier(user_level integer)
returns text
language plpgsql
immutable
set search_path = public
as $$
begin
  if user_level >= 96 then
    return 'SS';
  elsif user_level >= 71 then
    return 'S';
  elsif user_level >= 46 then
    return 'A';
  elsif user_level >= 26 then
    return 'B';
  elsif user_level >= 11 then
    return 'C';
  else
    return 'D';
  end if;
end;
$$;

create or replace function public.get_user_tier_label(user_level integer)
returns text
language sql
immutable
set search_path = public
as $$
  select public.get_user_tier(user_level) || '-Tier';
$$;

-- ---------------------------------------------------------------------------
-- XP award + level-up loop (uses level / xp columns on profiles)
-- ---------------------------------------------------------------------------
create or replace function public.award_xp_and_check_level(
  user_id uuid,
  xp_amount integer
)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_xp integer;
  v_required integer;
  v_leveled_up boolean := false;
begin
  if xp_amount is null or xp_amount <= 0 then
    raise exception 'xp_amount must be a positive integer';
  end if;

  if auth.uid() is distinct from user_id then
    raise exception 'not authorized';
  end if;

  select p.level, p.xp
  into v_level, v_xp
  from public.profiles p
  where p.id = user_id
  for update;

  if not found then
    raise exception 'profile not found';
  end if;

  v_xp := v_xp + xp_amount;

  loop
    v_required := 500 + (v_level * 150);
    exit when v_xp < v_required;
    v_xp := v_xp - v_required;
    v_level := v_level + 1;
    v_leveled_up := true;
  end loop;

  update public.profiles
  set
    level = v_level,
    xp = v_xp,
    current_rank = public.get_user_tier(v_level),
    updated_at = now()
  where id = user_id;

  return query select v_leveled_up, v_level, v_xp;
end;
$$;

revoke all on function public.award_xp_and_check_level(uuid, integer) from public;
grant execute on function public.award_xp_and_check_level(uuid, integer) to authenticated;

-- Backfill rank column for existing rows
update public.profiles
set current_rank = public.get_user_tier(level)
where current_rank is distinct from public.get_user_tier(level);


-- ============================================================
-- FILE: 20260628120000_username_length_check.sql
-- ============================================================

-- Username length + character validation (2–16, alphanumeric / _ / -)
-- Safe to re-run in SQL Editor.

alter table public.profiles
drop constraint if exists username_length_check;

alter table public.profiles
add constraint username_length_check
check (
  char_length(trim(username)) >= 2
  and char_length(trim(username)) <= 16
  and trim(username) ~ '^[a-zA-Z0-9_-]+$'
);

-- Existing policy "Users can update safe profile fields" already allows username
-- updates while blocking direct level/xp writes. No duplicate UPDATE policy needed.


-- ============================================================
-- FILE: 20260628140000_dashboard_metrics.sql
-- ============================================================

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


-- ============================================================
-- FILE: 20260629120000_profile_modules.sql
-- ============================================================

-- Focus sessions + user achievements for RPG profile modules

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_type text not null check (session_type in ('focus', 'short_break', 'long_break')),
  duration_seconds integer not null check (duration_seconds > 0),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists focus_sessions_user_completed_idx
  on public.focus_sessions (user_id, completed_at desc);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null,
  progress integer not null default 0 check (progress >= 0),
  unlocked_at timestamptz,
  xp_collected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_achievements_unique unique (user_id, achievement_id)
);

create index if not exists user_achievements_user_idx
  on public.user_achievements (user_id);

alter table public.focus_sessions enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "Users manage own focus sessions" on public.focus_sessions;
create policy "Users manage own focus sessions"
  on public.focus_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own achievements" on public.user_achievements;
create policy "Users manage own achievements"
  on public.user_achievements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.focus_sessions to authenticated;
grant select, insert, update, delete on public.user_achievements to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.user_achievements;
exception
  when duplicate_object then null;
end $$;


-- ============================================================
-- FILE: 20260630120000_finance_module.sql
-- ============================================================

-- Finance module: accounts, goals, subscriptions, extended transactions

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  icon text not null default '💳',
  color text not null default '#8B5CF6',
  currency text not null default 'RUB',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists finance_accounts_user_idx
  on public.finance_accounts (user_id);

create table if not exists public.finance_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  saved_amount numeric(14, 2) not null default 0 check (saved_amount >= 0),
  target_date date,
  icon text not null default '🎯',
  color text not null default '#8B5CF6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_goals_user_idx
  on public.finance_goals (user_id);

create table if not exists public.finance_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'RUB',
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  next_billing_date date,
  account_id uuid references public.finance_accounts (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists finance_subscriptions_user_idx
  on public.finance_subscriptions (user_id);

alter table public.transactions
  add column if not exists account_id uuid references public.finance_accounts (id) on delete set null,
  add column if not exists note text,
  add column if not exists occurred_at timestamptz default now();

create index if not exists transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc);

alter table public.finance_accounts enable row level security;
alter table public.finance_goals enable row level security;
alter table public.finance_subscriptions enable row level security;

drop policy if exists "Users manage own finance accounts" on public.finance_accounts;
create policy "Users manage own finance accounts"
  on public.finance_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own finance goals" on public.finance_goals;
create policy "Users manage own finance goals"
  on public.finance_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own finance subscriptions" on public.finance_subscriptions;
create policy "Users manage own finance subscriptions"
  on public.finance_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.finance_accounts to authenticated;
grant select, insert, update, delete on public.finance_goals to authenticated;
grant select, insert, update, delete on public.finance_subscriptions to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.transactions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.finance_goals;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.finance_subscriptions;
exception when duplicate_object then null;
end $$;


-- ============================================================
-- FILE: 20260701120000_finance_ecosystem.sql
-- ============================================================

-- Finance ecosystem: budgets, balances, task monetization, auto-sync trigger

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category varchar(50) not null,
  monthly_limit numeric(14, 2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now(),
  constraint budgets_user_category_unique unique (user_id, category)
);

create index if not exists budgets_user_idx on public.budgets (user_id);

alter table public.budgets enable row level security;

drop policy if exists "Users manage own budgets" on public.budgets;
create policy "Users manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.budgets to authenticated;

alter table public.finance_accounts
  add column if not exists balance numeric(14, 2) not null default 0,
  add column if not exists account_type varchar(20) not null default 'card';

alter table public.tasks
  add column if not exists is_monetized boolean not null default false,
  add column if not exists payout_amount numeric(12, 2),
  add column if not exists finance_category varchar(50) default 'freelance';

alter table public.transactions
  add column if not exists source_type varchar(20),
  add column if not exists source_ref varchar(120);

create unique index if not exists transactions_ecosystem_source_unique
  on public.transactions (user_id, source_type, source_ref)
  where source_type is not null and source_ref is not null;

create or replace function public.update_finance_account_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_id is null then
    return new;
  end if;

  if new.type = 'income' then
    update public.finance_accounts
    set balance = balance + new.amount
    where id = new.account_id;
  elsif new.type = 'expense' then
    update public.finance_accounts
    set balance = balance - new.amount
    where id = new.account_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_update_finance_account_balance on public.transactions;
create trigger trigger_update_finance_account_balance
  after insert on public.transactions
  for each row
  execute function public.update_finance_account_balance();

update public.finance_accounts fa
set balance = coalesce(
  (
    select sum(
      case
        when t.type = 'income' then t.amount
        when t.type = 'expense' then -t.amount
        else 0
      end
    )
    from public.transactions t
    where t.account_id = fa.id
  ),
  0
);

do $$
begin
  alter publication supabase_realtime add table public.budgets;
exception
  when duplicate_object then null;
end $$;


-- ============================================================
-- FILE: 20260702120000_workout_tracks_engine.sql
-- ============================================================

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


-- ============================================================
-- FILE: 20260703120000_nutrition_meal_slots.sql
-- ============================================================

alter table public.daily_nutrition_logs
  add column if not exists meal_slots jsonb not null default '{}'::jsonb;


-- ============================================================
-- FILE: 20260704120000_nutrition_quick_meals.sql
-- ============================================================

alter table public.daily_nutrition_logs
  add column if not exists quick_meals jsonb not null default '{}'::jsonb;


-- ============================================================
-- FILE: 20260704130000_weight_logs.sql
-- ============================================================

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric(5, 2) not null check (weight_kg > 0 and weight_kg <= 500),
  logged_on date not null default (timezone('utc', now()))::date,
  logged_at timestamptz not null default now(),
  constraint weight_logs_user_day unique (user_id, logged_on)
);

create index if not exists weight_logs_user_day_idx
  on public.weight_logs (user_id, logged_on desc);

alter table public.weight_logs enable row level security;

drop policy if exists "Users manage own weight logs" on public.weight_logs;
create policy "Users manage own weight logs"
  on public.weight_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.weight_logs to authenticated;


-- ============================================================
-- FILE: 20260704140000_workout_session_stats.sql
-- ============================================================

alter table public.workout_sessions
  add column if not exists tonnage_kg integer default 0;


-- ============================================================
-- FILE: 20260704150000_task_subtasks.sql
-- ============================================================

-- Task subtasks for Planner prioritized tasks

create table if not exists public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists task_subtasks_task_idx on public.task_subtasks (task_id, sort_order);
create index if not exists task_subtasks_user_idx on public.task_subtasks (user_id, created_at desc);

alter table public.task_subtasks enable row level security;

drop policy if exists "Users manage own task subtasks" on public.task_subtasks;
create policy "Users manage own task subtasks"
  on public.task_subtasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.task_subtasks to authenticated;


-- ============================================================
-- FILE: 20260704160000_mood_logs.sql
-- ============================================================

-- Daily mood check-ins

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood_score integer not null check (mood_score between 1 and 5),
  note text,
  logged_on date not null default current_date,
  logged_at timestamptz not null default now()
);

create index if not exists mood_logs_user_logged_idx
  on public.mood_logs (user_id, logged_on desc);

alter table public.mood_logs enable row level security;

drop policy if exists "Users manage own mood logs" on public.mood_logs;
create policy "Users manage own mood logs"
  on public.mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.mood_logs to authenticated;


-- ============================================================
-- FILE: 20260704170000_xp_ledger_exponential.sql
-- ============================================================

-- P10: XP ledger audit trail + exponential level curve (technical spec)
-- TotalXP(L) = 1000 * (L - 1)^1.5
-- XP to next level at L: 1000 * (L^1.5 - (L-1)^1.5)

create table if not exists public.xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount integer not null check (amount > 0),
  source_type text not null default 'xp_award',
  created_at timestamptz not null default now()
);

create index if not exists xp_ledger_user_created_idx
  on public.xp_ledger (user_id, created_at desc);

create index if not exists xp_ledger_user_source_day_idx
  on public.xp_ledger (user_id, source_type, ((created_at at time zone 'utc')::date));

alter table public.xp_ledger enable row level security;

drop policy if exists "Users read own xp ledger" on public.xp_ledger;
create policy "Users read own xp ledger"
  on public.xp_ledger for select
  using (auth.uid() = user_id);

grant select on public.xp_ledger to authenticated;

create or replace function public.xp_required_for_level(p_level integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select greatest(
    100,
    floor(
      1000 * (
        power(greatest(p_level, 1)::numeric, 1.5)
        - power(greatest(p_level - 1, 0)::numeric, 1.5)
      )
    )::integer
  );
$$;

create or replace function public.award_xp_and_check_level(
  user_id uuid,
  xp_amount integer,
  source_type text default 'xp_award'
)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_xp integer;
  v_required integer;
  v_leveled_up boolean := false;
  v_source text := coalesce(nullif(trim(source_type), ''), 'xp_award');
begin
  if xp_amount is null or xp_amount <= 0 then
    raise exception 'xp_amount must be a positive integer';
  end if;

  if auth.uid() is distinct from user_id then
    raise exception 'not authorized';
  end if;

  select p.level, p.xp
  into v_level, v_xp
  from public.profiles p
  where p.id = user_id
  for update;

  if not found then
    raise exception 'profile not found';
  end if;

  insert into public.xp_ledger (user_id, amount, source_type)
  values (user_id, xp_amount, v_source);

  v_xp := v_xp + xp_amount;

  loop
    v_required := public.xp_required_for_level(v_level);
    exit when v_xp < v_required;
    v_xp := v_xp - v_required;
    v_level := v_level + 1;
    v_leveled_up := true;
  end loop;

  update public.profiles
  set
    level = v_level,
    xp = v_xp,
    current_rank = public.get_user_tier(v_level),
    updated_at = now()
  where id = user_id;

  return query select v_leveled_up, v_level, v_xp;
end;
$$;

revoke all on function public.award_xp_and_check_level(uuid, integer, text) from public;
grant execute on function public.award_xp_and_check_level(uuid, integer, text) to authenticated;

-- Keep two-arg overload for older clients during rollout.
create or replace function public.award_xp_and_check_level(
  user_id uuid,
  xp_amount integer
)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer
)
language sql
security definer
set search_path = public
as $$
  select * from public.award_xp_and_check_level(user_id, xp_amount, 'xp_award');
$$;

revoke all on function public.award_xp_and_check_level(uuid, integer) from public;
grant execute on function public.award_xp_and_check_level(uuid, integer) to authenticated;


-- ============================================================
-- FILE: 20260704180000_nutrition_profile_exercise_prs.sql
-- ============================================================

-- P12: personalized nutrition targets + exercise personal records

alter table public.profiles
  add column if not exists height_cm integer check (height_cm >= 100 and height_cm <= 250),
  add column if not exists activity_factor numeric(3, 2) check (activity_factor >= 1.2 and activity_factor <= 1.9),
  add column if not exists diet_goal varchar(20) check (diet_goal in ('fat_loss', 'maintenance', 'bulk')),
  add column if not exists goal_pace_kg numeric(3, 2) check (goal_pace_kg >= 0 and goal_pace_kg <= 1.5);

create table if not exists public.exercise_prs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  estimated_1rm_kg numeric(7, 1) not null,
  best_weight_kg numeric(7, 1) not null,
  best_reps integer not null check (best_reps > 0),
  achieved_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, exercise_name)
);

create index if not exists exercise_prs_user_id_idx on public.exercise_prs (user_id);

alter table public.exercise_prs enable row level security;

drop policy if exists "Users manage own exercise prs" on public.exercise_prs;
create policy "Users manage own exercise prs"
  on public.exercise_prs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  alter publication supabase_realtime add table public.exercise_prs;
exception
  when duplicate_object then null;
end $$;


-- ============================================================
-- FILE: 20260705120000_finance_usd_default.sql
-- ============================================================

-- Switch finance defaults to USD and clear stale account balances without transactions.

alter table public.finance_accounts
  alter column currency set default 'USD';

update public.finance_accounts
set currency = 'USD'
where currency = 'RUB';

update public.finance_accounts fa
set balance = 0
where not exists (
  select 1
  from public.transactions t
  where t.account_id = fa.id
);


-- ============================================================
-- FILE: 20260705130000_security_hardening.sql
-- ============================================================

-- Security hardening: XP validation, achievements RPC, profile privacy, finance trigger, AI usage

-- ---------------------------------------------------------------------------
-- 1. XP source limits
-- ---------------------------------------------------------------------------
create table if not exists public.xp_source_limits (
  source_type text primary key,
  max_amount integer not null check (max_amount > 0),
  max_daily_awards integer not null default 50 check (max_daily_awards > 0)
);

insert into public.xp_source_limits (source_type, max_amount, max_daily_awards) values
  ('task_completed', 15, 200),
  ('subtask_completed', 5, 500),
  ('habit_completed', 75, 50),
  ('focus_session', 40, 20),
  ('workout_completed', 500, 10),
  ('food_or_water_logged', 10, 100),
  ('mood_logged', 10, 20),
  ('daily_streak_bonus', 150, 1),
  ('finance_subscription', 60, 20),
  ('finance_goal', 80, 20),
  ('finance_logged', 100, 50)
on conflict (source_type) do update set
  max_amount = excluded.max_amount,
  max_daily_awards = excluded.max_daily_awards;

create or replace function public.validate_xp_award(
  p_user_id uuid,
  p_xp_amount integer,
  p_source_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source text := coalesce(nullif(trim(p_source_type), ''), 'xp_award');
  v_base text;
  v_max_amount integer;
  v_max_daily integer;
  v_today_awards integer;
begin
  if p_xp_amount is null or p_xp_amount <= 0 then
    raise exception 'xp_amount must be a positive integer';
  end if;

  if v_source like 'achievement_%' then
    raise exception 'achievement XP must be collected via collect_achievement_reward';
  end if;

  if v_source like 'habit_completed:%' then
    v_base := 'habit_completed';
  else
    v_base := v_source;
  end if;

  select l.max_amount, l.max_daily_awards
  into v_max_amount, v_max_daily
  from public.xp_source_limits l
  where l.source_type = v_base;

  if not found then
    raise exception 'unknown or disallowed XP source: %', v_source;
  end if;

  if p_xp_amount > v_max_amount then
    raise exception 'XP amount % exceeds max % for source %', p_xp_amount, v_max_amount, v_source;
  end if;

  select count(*)::integer into v_today_awards
  from public.xp_ledger xl
  where xl.user_id = p_user_id
    and xl.source_type = v_source
    and (xl.created_at at time zone 'utc')::date = (now() at time zone 'utc')::date;

  if v_today_awards >= v_max_daily then
    raise exception 'daily XP award limit reached for source %', v_source;
  end if;
end;
$$;

create or replace function public.award_xp_internal(
  p_user_id uuid,
  p_xp_amount integer,
  p_source_type text,
  p_skip_client_validation boolean default false
)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_level integer;
  v_xp integer;
  v_required integer;
  v_leveled_up boolean := false;
  v_source text := coalesce(nullif(trim(p_source_type), ''), 'xp_award');
  v_def record;
begin
  if not p_skip_client_validation then
    perform public.validate_xp_award(p_user_id, p_xp_amount, v_source);
  elsif v_source like 'achievement_%' then
    select * into v_def
    from public.achievement_definitions ad
    where ('achievement_' || ad.id) = v_source;

    if not found then
      raise exception 'unknown achievement XP source';
    end if;

    if p_xp_amount <> v_def.xp_reward then
      raise exception 'invalid achievement XP amount';
    end if;
  else
    raise exception 'internal XP path requires achievement source';
  end if;

  select p.level, p.xp into v_level, v_xp
  from public.profiles p
  where p.id = p_user_id
  for update;

  if not found then
    raise exception 'profile not found';
  end if;

  insert into public.xp_ledger (user_id, amount, source_type)
  values (p_user_id, p_xp_amount, v_source);

  v_xp := v_xp + p_xp_amount;

  loop
    v_required := public.xp_required_for_level(v_level);
    exit when v_xp < v_required;
    v_xp := v_xp - v_required;
    v_level := v_level + 1;
    v_leveled_up := true;
  end loop;

  update public.profiles
  set
    level = v_level,
    xp = v_xp,
    current_rank = public.get_user_tier(v_level),
    updated_at = now()
  where id = p_user_id;

  return query select v_leveled_up, v_level, v_xp;
end;
$$;

create or replace function public.award_xp_and_check_level(
  user_id uuid,
  xp_amount integer,
  source_type text default 'xp_award'
)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from user_id then
    raise exception 'not authorized';
  end if;

  return query
  select * from public.award_xp_internal(user_id, xp_amount, source_type, false);
end;
$$;

drop function if exists public.award_xp_and_check_level(uuid, integer);

revoke all on function public.award_xp_internal(uuid, integer, text, boolean) from public;
revoke all on function public.validate_xp_award(uuid, integer, text) from public;

-- ---------------------------------------------------------------------------
-- 2. Achievements
-- ---------------------------------------------------------------------------
create table if not exists public.achievement_definitions (
  id text primary key,
  metric_key text not null,
  target_value integer not null check (target_value > 0),
  xp_reward integer not null check (xp_reward > 0)
);

insert into public.achievement_definitions (id, metric_key, target_value, xp_reward) values
  ('first_blood', 'tasks_completed', 1, 100),
  ('task_grinder', 'tasks_completed', 50, 100),
  ('iron_discipline', 'habit_streak_days', 7, 100),
  ('deep_focus', 'focus_sessions', 5, 100),
  ('level_climber', 'level_reached', 10, 150),
  ('centurion', 'tasks_completed', 100, 200)
on conflict (id) do update set
  metric_key = excluded.metric_key,
  target_value = excluded.target_value,
  xp_reward = excluded.xp_reward;

grant select on public.achievement_definitions to authenticated;

create or replace function public.compute_achievement_metrics(p_user_id uuid)
returns table (
  tasks_completed integer,
  habit_streak_days integer,
  focus_sessions integer,
  level_reached integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tasks integer := 0;
  v_focus integer := 0;
  v_level integer := 1;
  v_streak integer := 0;
  v_cursor date := (now() at time zone 'utc')::date;
begin
  select count(*)::integer into v_tasks
  from public.tasks t
  where t.user_id = p_user_id and t.completed = true;

  select coalesce(p.level, 1) into v_level
  from public.profiles p
  where p.id = p_user_id;

  select count(*)::integer into v_focus
  from public.focus_sessions fs
  where fs.user_id = p_user_id and fs.session_type = 'focus';

  loop
    exit when not exists (
      select 1 from public.habit_logs hl
      where hl.user_id = p_user_id
        and hl.completed = true
        and hl.logged_on = v_cursor
    );
    v_streak := v_streak + 1;
    v_cursor := v_cursor - 1;
  end loop;

  return query select v_tasks, v_streak, v_focus, v_level;
end;
$$;

create or replace function public.sync_user_achievements()
returns setof public.user_achievements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_metrics record;
  v_def record;
  v_progress integer;
  v_unlocked_at timestamptz;
  v_prev_unlocked timestamptz;
  v_xp_collected boolean;
  v_metric_value integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_metrics from public.compute_achievement_metrics(v_user_id);

  for v_def in select * from public.achievement_definitions order by id loop
    v_metric_value := case v_def.metric_key
      when 'tasks_completed' then v_metrics.tasks_completed
      when 'habit_streak_days' then v_metrics.habit_streak_days
      when 'focus_sessions' then v_metrics.focus_sessions
      when 'level_reached' then v_metrics.level_reached
      else 0
    end;

    v_progress := least(v_metric_value, v_def.target_value);

    select ua.unlocked_at, ua.xp_collected
    into v_prev_unlocked, v_xp_collected
    from public.user_achievements ua
    where ua.user_id = v_user_id and ua.achievement_id = v_def.id;

    if v_prev_unlocked is not null then
      v_unlocked_at := v_prev_unlocked;
    elsif v_progress >= v_def.target_value then
      v_unlocked_at := now();
    else
      v_unlocked_at := null;
    end if;

    insert into public.user_achievements (
      user_id,
      achievement_id,
      progress,
      unlocked_at,
      xp_collected,
      updated_at
    )
    values (
      v_user_id,
      v_def.id,
      v_progress,
      v_unlocked_at,
      coalesce(v_xp_collected, false),
      now()
    )
    on conflict (user_id, achievement_id) do update set
      progress = excluded.progress,
      unlocked_at = coalesce(public.user_achievements.unlocked_at, excluded.unlocked_at),
      updated_at = now();

    return query
    select ua.*
    from public.user_achievements ua
    where ua.user_id = v_user_id and ua.achievement_id = v_def.id;
  end loop;
end;
$$;

create or replace function public.collect_achievement_reward(p_achievement_id text)
returns table (
  leveled_up boolean,
  new_level integer,
  new_xp integer,
  xp_awarded integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_def record;
  v_row public.user_achievements%rowtype;
  v_metrics record;
  v_metric_value integer;
  v_result record;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_def
  from public.achievement_definitions ad
  where ad.id = p_achievement_id;

  if not found then
    raise exception 'unknown achievement';
  end if;

  select * into v_row
  from public.user_achievements ua
  where ua.user_id = v_user_id and ua.achievement_id = p_achievement_id
  for update;

  if not found or v_row.unlocked_at is null then
    raise exception 'achievement not unlocked';
  end if;

  if v_row.xp_collected then
    raise exception 'reward already collected';
  end if;

  select * into v_metrics from public.compute_achievement_metrics(v_user_id);
  v_metric_value := case v_def.metric_key
    when 'tasks_completed' then v_metrics.tasks_completed
    when 'habit_streak_days' then v_metrics.habit_streak_days
    when 'focus_sessions' then v_metrics.focus_sessions
    when 'level_reached' then v_metrics.level_reached
    else 0
  end;

  if v_metric_value < v_def.target_value then
    raise exception 'achievement requirements not met';
  end if;

  update public.user_achievements
  set xp_collected = true, updated_at = now()
  where user_id = v_user_id and achievement_id = p_achievement_id;

  select * into v_result
  from public.award_xp_internal(
    v_user_id,
    v_def.xp_reward,
    'achievement_' || p_achievement_id,
    true
  );

  return query
  select v_result.leveled_up, v_result.new_level, v_result.new_xp, v_def.xp_reward;
end;
$$;

grant execute on function public.sync_user_achievements() to authenticated;
grant execute on function public.collect_achievement_reward(text) to authenticated;

drop policy if exists "Users manage own achievements" on public.user_achievements;
drop policy if exists "Users read own achievements" on public.user_achievements;
create policy "Users read own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

revoke insert, update, delete on public.user_achievements from authenticated;
grant select on public.user_achievements to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Profile privacy
-- ---------------------------------------------------------------------------
drop policy if exists "Profiles are readable by everyone" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

revoke select on public.profiles from anon;

drop view if exists public.leaderboard;
create view public.leaderboard
with (security_invoker = false)
as
select
  p.id,
  p.username,
  p.level,
  p.xp,
  p.days_active,
  p.focus_hours,
  p.habits_count,
  public.get_user_tier(p.level) as performance_tier,
  public.get_user_tier_label(p.level) as performance_tier_label,
  rank() over (order by p.level desc, p.xp desc, p.updated_at asc)::integer as rank_position
from public.profiles p;

grant select on public.leaderboard to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Finance trigger
-- ---------------------------------------------------------------------------
create or replace function public.update_finance_account_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.account_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.finance_accounts fa
    where fa.id = new.account_id
      and fa.user_id = new.user_id
  ) then
    raise exception 'account_id does not belong to user';
  end if;

  if new.type = 'income' then
    update public.finance_accounts
    set balance = balance + new.amount
    where id = new.account_id and user_id = new.user_id;
  elsif new.type = 'expense' then
    update public.finance_accounts
    set balance = balance - new.amount
    where id = new.account_id and user_id = new.user_id;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. AI Coach rate limit + Pro cache (service-role writes only)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_coach_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists ai_coach_usage_user_day_idx
  on public.ai_coach_usage (user_id, ((created_at at time zone 'utc')::date));

alter table public.ai_coach_usage enable row level security;

drop policy if exists "Users read own ai coach usage" on public.ai_coach_usage;
create policy "Users read own ai coach usage"
  on public.ai_coach_usage for select
  using (auth.uid() = user_id);

revoke all on public.ai_coach_usage from authenticated, anon;
grant select on public.ai_coach_usage to authenticated;

alter table public.profiles
  add column if not exists is_pro boolean not null default false,
  add column if not exists pro_expires_at timestamptz;

create or replace function public.user_has_pro_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.is_pro and (p.pro_expires_at is null or p.pro_expires_at > now())
      from public.profiles p
      where p.id = p_user_id
    ),
    false
  );
$$;

revoke all on function public.user_has_pro_access(uuid) from public;
grant execute on function public.user_has_pro_access(uuid) to authenticated;

-- Block client-side Pro flag tampering (only service role may update is_pro)
drop policy if exists "Users can update safe profile fields" on public.profiles;
create policy "Users can update safe profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and level is not distinct from (
      select p.level from public.profiles p where p.id = auth.uid()
    )
    and xp is not distinct from (
      select p.xp from public.profiles p where p.id = auth.uid()
    )
    and is_pro is not distinct from (
      select p.is_pro from public.profiles p where p.id = auth.uid()
    )
    and pro_expires_at is not distinct from (
      select p.pro_expires_at from public.profiles p where p.id = auth.uid()
    )
  );


-- ============================================================
-- FILE: 20260712180000_tma_stars_access.sql
-- ============================================================

-- Telegram Mini App: 3-day trial + Telegram Stars Pro access

alter table public.profiles
  add column if not exists tma_trial_started_at timestamptz,
  add column if not exists telegram_user_id bigint,
  add column if not exists telegram_reminders_enabled boolean not null default false;

create unique index if not exists profiles_telegram_user_id_key
  on public.profiles (telegram_user_id)
  where telegram_user_id is not null;

create table if not exists public.telegram_stars_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  telegram_user_id bigint not null,
  telegram_payment_charge_id text not null unique,
  stars_amount integer not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.telegram_stars_payments enable row level security;

drop policy if exists "Users read own telegram stars payments" on public.telegram_stars_payments;
create policy "Users read own telegram stars payments"
  on public.telegram_stars_payments for select
  using (auth.uid() = user_id);

revoke all on public.telegram_stars_payments from authenticated, anon;
grant select on public.telegram_stars_payments to authenticated;

create or replace function public.user_has_premium_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        (p.is_pro and (p.pro_expires_at is null or p.pro_expires_at > now()))
        or (
          p.tma_trial_started_at is not null
          and p.tma_trial_started_at + interval '3 days' > now()
        )
      from public.profiles p
      where p.id = p_user_id
    ),
    false
  );
$$;

revoke all on function public.user_has_premium_access(uuid) from public;
grant execute on function public.user_has_premium_access(uuid) to authenticated, service_role;

create or replace function public.user_can_use_notifications(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_has_premium_access(p_user_id);
$$;

revoke all on function public.user_can_use_notifications(uuid) from public;
grant execute on function public.user_can_use_notifications(uuid) to authenticated, service_role;

-- Prevent client-side trial / Telegram ID tampering (edge functions use service role)
drop policy if exists "Users can update safe profile fields" on public.profiles;
create policy "Users can update safe profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and level is not distinct from (
      select p.level from public.profiles p where p.id = auth.uid()
    )
    and xp is not distinct from (
      select p.xp from public.profiles p where p.id = auth.uid()
    )
    and is_pro is not distinct from (
      select p.is_pro from public.profiles p where p.id = auth.uid()
    )
    and pro_expires_at is not distinct from (
      select p.pro_expires_at from public.profiles p where p.id = auth.uid()
    )
    and tma_trial_started_at is not distinct from (
      select p.tma_trial_started_at from public.profiles p where p.id = auth.uid()
    )
    and telegram_user_id is not distinct from (
      select p.telegram_user_id from public.profiles p where p.id = auth.uid()
    )
  );


-- ============================================================
-- FILE: 20260712210000_telegram_chat_reminders.sql
-- ============================================================

-- Telegram chat reminders: timezone, activity tracking, delivery dedup

alter table public.profiles
  add column if not exists timezone text not null default 'UTC',
  add column if not exists last_active_at timestamptz;

create table if not exists public.telegram_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slot_id text not null,
  delivery_date date not null,
  created_at timestamptz not null default now(),
  constraint telegram_reminder_deliveries_unique unique (user_id, slot_id, delivery_date)
);

create index if not exists telegram_reminder_deliveries_user_date_idx
  on public.telegram_reminder_deliveries (user_id, delivery_date);

alter table public.telegram_reminder_deliveries enable row level security;

revoke all on public.telegram_reminder_deliveries from authenticated, anon;

-- pg_cron + pg_net: enable both in Supabase Dashboard → Database → Extensions first.
-- Then run scripts/setup-telegram-cron.sql with your project ref and CRON_SECRET.

commit;
