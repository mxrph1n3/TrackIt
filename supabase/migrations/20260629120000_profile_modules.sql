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
