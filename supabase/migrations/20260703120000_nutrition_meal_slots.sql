alter table public.daily_nutrition_logs
  add column if not exists meal_slots jsonb not null default '{}'::jsonb;
