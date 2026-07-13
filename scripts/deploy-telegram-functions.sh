#!/usr/bin/env bash
set -euo pipefail

echo "Deploying Telegram edge functions (JWT verification disabled for webhooks)…"

npx supabase functions deploy telegram-webhook --no-verify-jwt
npx supabase functions deploy telegram-auth --no-verify-jwt
npx supabase functions deploy telegram-send-reminders --no-verify-jwt
npx supabase functions deploy telegram-reminder-welcome --no-verify-jwt
npx supabase functions deploy tma-access
npx supabase functions deploy telegram-create-invoice

echo "Done. Ensure secrets are set:"
echo "  npx supabase secrets set TELEGRAM_BOT_TOKEN=\"<from BotFather>\" TMA_WEB_APP_URL=\"https://track-it-umber-psi.vercel.app\" TMA_STARS_PRICE=\"300\" TMA_MONTHLY_PRICE_LABEL=\"\$5.99/month\""
