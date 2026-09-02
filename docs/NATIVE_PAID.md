# Native paid Pro (direct store IAP)

TrackIt Pro via **App Store** and **Google Play** subscriptions (`expo-iap`). Soft **3-day trial**, then paywall. No RevenueCat.

## Product IDs

| Platform | Monthly | Yearly |
| --- | --- | --- |
| **Google Play** | `trackit_pro_monthly` | `trackit_pro_yearly` |
| **App Store** | `trackit_pro_monthly_v2` | `trackit_pro_yearly_v2` |

iOS uses `_v2` because the original IDs were already used as non-subscription IAPs.

## Russia / blocked regions (required)

Payments must **not** be available in Russia.

### Console (primary — do this)

1. **App Store Connect** → App → Pricing and Availability → uncheck **Russia** (and any RU territories).
2. **Google Play Console** → Reach / Countries → exclude **Russia**.
3. Confirm IAP products are not sold in RU storefronts.

### In-app / server (already in code)

- Native: `getStorefront()` — blocks `RU` / `RUS` before `requestPurchase`.
- Telegram Stars: `telegram-create-invoice` + pre-checkout reject CDN country `RU`.

Locale `ru` (UI language) is **not** a payment block.

## Android

1. Play Console → Monetize → Subscriptions → create both products (without `_v2`)
2. Activate base plans / offers
3. Requires Billing Library **v8+** (via `expo-iap`)

## iOS checklist

1. App Store Connect → Subscriptions → `trackit_pro_monthly_v2` + `trackit_pro_yearly_v2` in one group
2. Paid Apps Agreement + banking/tax active
3. App ID capability **In-App Purchase** for `com.trackit.lifeos`
4. Sandbox tester + TestFlight / App Store build (not Expo Go)
5. Align version: `app.json` version / `buildNumber` with ASC

## App / EAS

No billing API keys in the client. Ensure Supabase env:

```
EXPO_PUBLIC_SUPABASE_URL=…
EXPO_PUBLIC_SUPABASE_ANON_KEY=…
```

After purchase/restore, the app syncs `profiles.is_pro` via `sync-subscription-status`.

Deploy edge updates after pull:

```
supabase functions deploy telegram-create-invoice
# webhook uses shared starsPayment — redeploy telegram webhook function if separate
```

## Restore / manage

- Premium → **Restore purchases**
- Premium → **Manage subscription** (opens Apple / Google subscription settings)
