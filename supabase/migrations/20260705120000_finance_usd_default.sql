-- Switch finance defaults to USD and clear stale account balances without transactions.

alter table public.finance_accounts
  alter column currency set default 'USD';

update public.finance_accounts
set currency = 'USD'
where currency = 'RUB';

update public.finance_accounts fa
set balance = 0
where not exists (
  select 1
  from public.transactions t
  where t.account_id = fa.id
);
