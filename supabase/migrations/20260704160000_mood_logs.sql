-- Daily mood check-ins

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood_score integer not null check (mood_score between 1 and 5),
  note text,
  logged_on date not null default current_date,
  logged_at timestamptz not null default now()
);

create index if not exists mood_logs_user_logged_idx
  on public.mood_logs (user_id, logged_on desc);

alter table public.mood_logs enable row level security;

drop policy if exists "Users manage own mood logs" on public.mood_logs;
create policy "Users manage own mood logs"
  on public.mood_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.mood_logs to authenticated;
