-- Finance ecosystem: budgets, balances, task monetization, auto-sync trigger

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category varchar(50) not null,
  monthly_limit numeric(14, 2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now(),
  constraint budgets_user_category_unique unique (user_id, category)
);

create index if not exists budgets_user_idx on public.budgets (user_id);

alter table public.budgets enable row level security;

drop policy if exists "Users manage own budgets" on public.budgets;
create policy "Users manage own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.budgets to authenticated;

alter table public.finance_accounts
  add column if not exists balance numeric(14, 2) not null default 0,
  add column if not exists account_type varchar(20) not null default 'card';

alter table public.tasks
  add column if not exists is_monetized boolean not null default false,
  add column if not exists payout_amount numeric(12, 2),
  add column if not exists finance_category varchar(50) default 'freelance';

alter table public.transactions
  add column if not exists source_type varchar(20),
  add column if not exists source_ref varchar(120);

create unique index if not exists transactions_ecosystem_source_unique
  on public.transactions (user_id, source_type, source_ref)
  where source_type is not null and source_ref is not null;

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

  if new.type = 'income' then
    update public.finance_accounts
    set balance = balance + new.amount
    where id = new.account_id;
  elsif new.type = 'expense' then
    update public.finance_accounts
    set balance = balance - new.amount
    where id = new.account_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_update_finance_account_balance on public.transactions;
create trigger trigger_update_finance_account_balance
  after insert on public.transactions
  for each row
  execute function public.update_finance_account_balance();

update public.finance_accounts fa
set balance = coalesce(
  (
    select sum(
      case
        when t.type = 'income' then t.amount
        when t.type = 'expense' then -t.amount
        else 0
      end
    )
    from public.transactions t
    where t.account_id = fa.id
  ),
  0
);

do $$
begin
  alter publication supabase_realtime add table public.budgets;
exception
  when duplicate_object then null;
end $$;
