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

alter table public.profiles
  alter column focus_hours type numeric(10, 2) using focus_hours::numeric(10, 2),
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
