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
