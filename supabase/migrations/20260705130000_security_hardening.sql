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
