# Free app branch (`free-app`)

This branch ships TrackIt with **all features unlocked** and **no billing** (no RevenueCat, no Telegram Stars, no paywalls).

## Client

- `src/constants/appAccess.ts` — `APP_IS_FULLY_FREE = true`
- Subscription store treats every user as Pro; RevenueCat is not initialized
- Paywall UI is hidden; profile menu has no "TrackIt Pro" entry

## Server (Supabase Edge Functions)

- `supabase/functions/_shared/appAccess.ts` — `APP_FULLY_FREE` env (defaults to enabled on this branch)
- `ai-coach-analyze` — skips Pro verification when free mode is on
- `telegramReminders` — sends reminders without premium check when free mode is on

Deploy edge functions from this branch. Optional: set `APP_FULLY_FREE=false` in Supabase secrets to restore server-side Pro checks without changing code.

## Builds

Use this branch for store builds where subscriptions are not offered:

```bash
git checkout free-app
npm run build:android   # or build:preview:android for APK QA
```

## Returning to paid app

On `main`, keep `APP_IS_FULLY_FREE = false` (or remove `appAccess.ts` usage). Do not merge `free-app` into `main` without reverting the flag and restoring paywall flows.
