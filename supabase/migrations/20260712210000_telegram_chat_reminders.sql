-- Telegram chat reminders: timezone, activity tracking, delivery dedup

alter table public.profiles
  add column if not exists timezone text not null default 'UTC',
  add column if not exists last_active_at timestamptz;

create table if not exists public.telegram_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slot_id text not null,
  delivery_date date not null,
  created_at timestamptz not null default now(),
  constraint telegram_reminder_deliveries_unique unique (user_id, slot_id, delivery_date)
);

create index if not exists telegram_reminder_deliveries_user_date_idx
  on public.telegram_reminder_deliveries (user_id, delivery_date);

alter table public.telegram_reminder_deliveries enable row level security;

revoke all on public.telegram_reminder_deliveries from authenticated, anon;

-- pg_cron + pg_net: enable both in Supabase Dashboard → Database → Extensions first.
-- Then run scripts/setup-telegram-cron.sql with your project ref and CRON_SECRET.
