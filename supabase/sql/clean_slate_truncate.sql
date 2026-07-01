-- Clean slate: wipe test rows (tables remain intact)
-- Run in Supabase SQL Editor while signed in as the test user.

TRUNCATE TABLE public.tasks CASCADE;
TRUNCATE TABLE public.habit_logs CASCADE;
-- TRUNCATE TABLE public.habits CASCADE;

TRUNCATE TABLE public.workout_sessions CASCADE;
TRUNCATE TABLE public.daily_nutrition_logs CASCADE;
TRUNCATE TABLE public.water_logs CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.journal_entries CASCADE;

-- Reset current profile progression (uses level/xp, not legacy current_level/current_exp)
UPDATE public.profiles
SET
  level = 1,
  xp = 0,
  current_rank = 'D',
  focus_hours = 0,
  habits_count = 0,
  days_active = 1
WHERE id = auth.uid();
