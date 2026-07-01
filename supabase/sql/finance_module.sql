-- Finance module: accounts, goals, subscriptions, extended transactions
-- Run in Supabase SQL Editor

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  icon text not null default '💳',
  color text not null default '#8B5CF6',
  currency text not null default 'RUB',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists finance_accounts_user_idx
  on public.finance_accounts (user_id);

create table if not exists public.finance_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  saved_amount numeric(14, 2) not null default 0 check (saved_amount >= 0),
  target_date date,
  icon text not null default '🎯',
  color text not null default '#8B5CF6',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_goals_user_idx
  on public.finance_goals (user_id);

create table if not exists public.finance_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'RUB',
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  next_billing_date date,
  account_id uuid references public.finance_accounts (id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists finance_subscriptions_user_idx
  on public.finance_subscriptions (user_id);

alter table public.transactions
  add column if not exists account_id uuid references public.finance_accounts (id) on delete set null,
  add column if not exists note text,
  add column if not exists occurred_at timestamptz default now();

alter table public.finance_accounts enable row level security;
alter table public.finance_goals enable row level security;
alter table public.finance_subscriptions enable row level security;

drop policy if exists "Users manage own finance accounts" on public.finance_accounts;
create policy "Users manage own finance accounts"
  on public.finance_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own finance goals" on public.finance_goals;
create policy "Users manage own finance goals"
  on public.finance_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own finance subscriptions" on public.finance_subscriptions;
create policy "Users manage own finance subscriptions"
  on public.finance_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.finance_accounts to authenticated;
grant select, insert, update, delete on public.finance_goals to authenticated;
grant select, insert, update, delete on public.finance_subscriptions to authenticated;
