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
