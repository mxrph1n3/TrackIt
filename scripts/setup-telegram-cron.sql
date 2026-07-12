-- Run once in Supabase SQL Editor after:
-- 1. Enabling extensions: pg_cron, pg_net (Dashboard → Database → Extensions)
-- 2. Setting CRON_SECRET: npx supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"
-- 3. Deploying: npx supabase functions deploy telegram-send-reminders
--
-- Replace YOUR_PROJECT_REF and YOUR_CRON_SECRET below.

select cron.unschedule('telegram-send-reminders')
where exists (
  select 1 from cron.job where jobname = 'telegram-send-reminders'
);

select cron.schedule(
  'telegram-send-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/telegram-send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_CRON_SECRET'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
