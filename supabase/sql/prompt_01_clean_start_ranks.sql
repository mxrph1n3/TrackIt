-- =============================================================================
-- Prompt #1: Clean-start registration + server-side level tier ranks
-- Run this entire script in Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (idempotent).
-- =============================================================================

-- 1. Secure profile table for the RPG Life OS system
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  days_active integer not null default 1 check (days_active >= 0),
  focus_hours numeric(10, 2) not null default 0.0 check (focus_hours >= 0),
  habits_count integer not null default 0 check (habits_count >= 0),
  updated_at timestamptz not null default now()
);

-- 2. Server-side tier from level (D → SS)
create or replace function public.get_user_tier(user_level integer)
returns text
language plpgsql
immutable
set search_path = public
as $$
begin
  if user_level between 1 and 9 then return 'D';
  elsif user_level between 10 and 19 then return 'C';
  elsif user_level between 20 and 29 then return 'B';
  elsif user_level between 30 and 44 then return 'A';
  elsif user_level between 45 and 59 then return 'S';
  elsif user_level >= 60 then return 'SS';
  else return 'D';
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

-- 3. Zero-state registration trigger (Level 1 / 0 XP)
create or replace function public.handle_new_user_setup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    'user_' || left(replace(new.id::text, '-', ''), 8)
  );

  insert into public.profiles (id, username, level, xp, days_active, focus_hours, habits_count)
  values (new.id, v_username, 1, 0, 1, 0.0, 0)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_registered on auth.users;
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_registered
  after insert on auth.users
  for each row execute function public.handle_new_user_setup();

-- 4. Leaderboard view with rank + tier coordinates
create or replace view public.leaderboard as
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
  rank() over (order by p.xp desc, p.level desc, p.updated_at asc)::integer as rank_position
from public.profiles p;

grant execute on function public.get_user_tier(integer) to anon, authenticated;
grant execute on function public.get_user_tier_label(integer) to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
