# Native paid Pro (direct store IAP)

TrackIt Pro via **App Store** and **Google Play** subscriptions (`expo-iap`). Soft **3-day trial**, then paywall. No RevenueCat.

## Product IDs

Create these exact auto-renewable subscription IDs in both consoles:

| ID | Price (display fallback) |
| --- | --- |
| `trackit_pro_monthly` | $5.00 / month |
| `trackit_pro_yearly` | $50.00 / year |

## Android

1. Play Console → Monetize → Subscriptions → create both products
2. Activate / push to production (or license testers for sandbox)
3. Requires Billing Library **v8+** (shipped via `expo-iap`)

## iOS

1. App Store Connect → Subscriptions → create both products in one subscription group
2. Sandbox testers for QA

## App / EAS

No billing API keys are required in the client. Ensure Supabase env is set:

```
EXPO_PUBLIC_SUPABASE_URL=…
EXPO_PUBLIC_SUPABASE_ANON_KEY=…
```

After purchase/restore, the app syncs `profiles.is_pro` via `sync-subscription-status`.

## Restore / manage

- Premium → **Restore purchases**
- Premium → **Manage subscription** (opens Apple / Google subscription settings)
