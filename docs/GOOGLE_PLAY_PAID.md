# Google Play paid Pro

**iOS and Android** use direct store IAP (`expo-iap`) + paywalls + a **3-day soft trial**. See also `docs/NATIVE_PAID.md`.

## Product IDs

- `trackit_pro_monthly`
- `trackit_pro_yearly`

## Play Console

1. Monetize → Subscriptions → create both products with those IDs
2. Add license testers for sandbox
3. Upload a signed AAB that includes Billing Library v8+ (`expo-iap`)

## Env

Only Supabase public keys are required in the client. No RevenueCat keys.

## Restore

Premium screen → **Restore purchases**.

## iOS

Same product IDs in App Store Connect. Soft trial + paywall match Android.
