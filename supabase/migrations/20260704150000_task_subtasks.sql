-- Task subtasks for Planner prioritized tasks

create table if not exists public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists task_subtasks_task_idx on public.task_subtasks (task_id, sort_order);
create index if not exists task_subtasks_user_idx on public.task_subtasks (user_id, created_at desc);

alter table public.task_subtasks enable row level security;

drop policy if exists "Users manage own task subtasks" on public.task_subtasks;
create policy "Users manage own task subtasks"
  on public.task_subtasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.task_subtasks to authenticated;
