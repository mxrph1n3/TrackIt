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
