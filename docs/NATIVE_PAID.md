# Paid native builds (iOS + Android)

TrackIt Pro via **RevenueCat** on **App Store** and **Google Play**. Soft **3-day trial**, then paywall.

## Client flags

`src/constants/appAccess.ts`:

- `IOS_BILLING_ENABLED = true`
- `ANDROID_BILLING_ENABLED = true`

Product IDs: `trackit_pro_monthly`, `trackit_pro_yearly`  
Entitlement: **`pro`**  
Fallback price: **$5.00/month**

## Soft trial (3 days) — iOS + Android

On first native launch:

- Full Pro access during trial
- **Subscribe** button visible in Profile (pay early)
- After trial: Pro features lock, paywall opens once
- Storage: `@trackit/soft_trial_started_at`

## Google Play Billing Library (deadline 31 Aug 2026)

Requires Billing Library **v8+**. Project uses `react-native-purchases` **≥ 9.x**. Rebuild AAB after upgrade.

## Store setup

### Google Play

1. Subscriptions `trackit_pro_monthly` / `trackit_pro_yearly`
2. RevenueCat → Google app + `goog_…` key

### App Store Connect

1. Auto-renewable subscriptions with the same product IDs
2. RevenueCat → Apple app + `appl_…` key
3. Paid Apps Agreement + banking + tax complete

## EAS env

```
EXPO_PUBLIC_SUPABASE_URL=…
EXPO_PUBLIC_SUPABASE_ANON_KEY=…
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_…
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=appl_…
```

## Build

```bash
npm run build:android
npm run build:ios
```

More detail (Play-focused): historically `docs/GOOGLE_PLAY_PAID.md` — same products apply to iOS.
