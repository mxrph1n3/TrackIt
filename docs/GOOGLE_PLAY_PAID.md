# Google Play / App Store — paid build (TrackIt Pro)

**iOS and Android** use RevenueCat + paywalls + a **3-day soft trial**. See also `docs/NATIVE_PAID.md`.

## Client flags

- `src/constants/appAccess.ts` — `IOS_BILLING_ENABLED = true`, `ANDROID_BILLING_ENABLED = true`
- Product IDs: `trackit_pro_monthly`, `trackit_pro_yearly`
- Entitlement: **`pro`**
- Display fallback: **$5.00/month**

## Soft trial (3 days)

On first **iOS or Android** launch (`NATIVE_SOFT_TRIAL_DAYS`):

- Full Pro access during the trial
- **Subscribe** button stays visible in Profile so users can pay early
- After trial ends, Pro features lock and the paywall opens once
- Storage: AsyncStorage `@trackit/soft_trial_started_at`

## Google Play Billing Library (deadline 31 Aug 2026)

Play requires Billing Library **v8+** for new uploads after that date. This project uses `react-native-purchases` **≥ 9.x** (PBL 8). Rebuild the AAB after `npm install`.

## 1. Google Play Console

1. Create app `com.trackit.lifeos`
2. **Monetize → Subscriptions**:
   - `trackit_pro_monthly` — auto-renewing, **$4.99–5.00/month** (match your region)
   - `trackit_pro_yearly` — optional annual plan
3. Activate subscriptions and link to a release track (internal testing first)

## 2. RevenueCat

1. Project → **Apps** → add **Google Play** app (package `com.trackit.lifeos`)
2. Link Play service account (JSON key) per [RevenueCat docs](https://www.revenuecat.com/docs/google-play-store)
3. Create entitlement **`pro`**
4. Attach both product IDs to offering **default**
5. Copy **Google API key** (`goog_…`)

## 3. EAS build secrets

Set at [expo.dev](https://expo.dev) → project → **Environment variables** (production):

```
EXPO_PUBLIC_SUPABASE_URL=…
EXPO_PUBLIC_SUPABASE_ANON_KEY=…
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=goog_…
```

Do **not** commit RevenueCat keys to git.

## 4. Build APK/AAB

```bash
git checkout free-app
npm install
npm run build:android
# or internal QA:
npm run build:preview:android
```

Upload AAB to Play Console → Internal testing → install on device → open Profile → **Upgrade to Pro** or locked feature → paywall → purchase.

## 5. Restore purchases

Premium screen → **Restore purchases** (RevenueCat `restorePurchases`).

## iOS note

Same soft trial + paywall as Android. Set `EXPO_PUBLIC_REVENUECAT_APPLE_KEY` and create matching IAP products in App Store Connect. Set `IOS_BILLING_ENABLED = false` only if you need a free App Store build again.
