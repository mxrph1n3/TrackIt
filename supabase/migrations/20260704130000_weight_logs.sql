create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric(5, 2) not null check (weight_kg > 0 and weight_kg <= 500),
  logged_on date not null default (timezone('utc', now()))::date,
  logged_at timestamptz not null default now(),
  constraint weight_logs_user_day unique (user_id, logged_on)
);

create index if not exists weight_logs_user_day_idx
  on public.weight_logs (user_id, logged_on desc);

alter table public.weight_logs enable row level security;

drop policy if exists "Users manage own weight logs" on public.weight_logs;
create policy "Users manage own weight logs"
  on public.weight_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.weight_logs to authenticated;
