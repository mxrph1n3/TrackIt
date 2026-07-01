alter table public.daily_nutrition_logs
  add column if not exists quick_meals jsonb not null default '{}'::jsonb;
