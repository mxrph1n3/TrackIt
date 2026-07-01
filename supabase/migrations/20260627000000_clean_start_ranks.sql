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
