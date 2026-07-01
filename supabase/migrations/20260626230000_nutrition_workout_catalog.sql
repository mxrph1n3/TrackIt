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
