# Free app / paid flags

Paid Pro is **on for both iOS and Android** when:

- `IOS_BILLING_ENABLED = true`
- `ANDROID_BILLING_ENABLED = true`

See **`docs/NATIVE_PAID.md`** and **`docs/GOOGLE_PLAY_PAID.md`**.

To ship a fully free store build again, set the matching flag to `false` in `src/constants/appAccess.ts`.

## Soft trial

`NATIVE_SOFT_TRIAL_DAYS = 3` — full access, Subscribe CTA early, then gating.

## Server

Set Supabase secret `APP_FULLY_FREE=false` so edge functions enforce Pro again.
