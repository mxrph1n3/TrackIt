-- RPG Progression v2 — paste into Supabase SQL Editor
-- See supabase/migrations/20260628000000_rpg_progression_v2.sql

alter table public.profiles
  add column if not exists current_rank varchar(2) default 'D';

create or replace function public.get_user_tier(user_level integer)
returns text
language plpgsql
immutable
set search_path = public
as $$
begin
  if user_level >= 96 then return 'SS';
  elsif user_level >= 71 then return 'S';
  elsif user_level >= 46 then return 'A';
  elsif user_level >= 26 then return 'B';
  elsif user_level >= 11 then return 'C';
  else return 'D';
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

create or replace function public.award_xp_and_check_level(
  user_id uuid,
  xp_amount integer
)
returns table (leveled_up boolean, new_level integer, new_xp integer)
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

  select p.level, p.xp into v_level, v_xp
  from public.profiles p where p.id = user_id for update;

  if not found then raise exception 'profile not found'; end if;

  v_xp := v_xp + xp_amount;
  loop
    v_required := 500 + (v_level * 150);
    exit when v_xp < v_required;
    v_xp := v_xp - v_required;
    v_level := v_level + 1;
    v_leveled_up := true;
  end loop;

  update public.profiles
  set level = v_level, xp = v_xp,
      current_rank = public.get_user_tier(v_level),
      updated_at = now()
  where id = user_id;

  return query select v_leveled_up, v_level, v_xp;
end;
$$;

revoke all on function public.award_xp_and_check_level(uuid, integer) from public;
grant execute on function public.award_xp_and_check_level(uuid, integer) to authenticated;

update public.profiles
set current_rank = public.get_user_tier(level)
where current_rank is distinct from public.get_user_tier(level);
