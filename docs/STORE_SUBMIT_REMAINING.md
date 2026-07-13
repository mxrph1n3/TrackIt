# Remaining store submit checklist (free-app)

Branch: `free-app`. Use after code review blockers are fixed.

## 1. Legal pages (Vercel)

App links:
- https://track-it-umber-psi.vercel.app/privacy
- https://track-it-umber-psi.vercel.app/terms

**Option A — point Vercel Production to `free-app`**
1. Vercel → Project → Settings → Git → Production Branch = `free-app`
2. Redeploy Production

**Option B — one-off deploy from this machine**
```bash
git checkout free-app
npm run export:web
npx vercel --prod --yes
```

**Verify in browser (must succeed):**
- Privacy has **no** RevenueCat / $5.99 / Gemini / AI Coach
- Terms say **free of charge** and **no** “optional AI analysis”

---

## 2. Demo account (required for App Review)

In [Supabase](https://supabase.com) → Authentication → Users → Add user:

| Field | Value |
|-------|--------|
| Email | `review@trackit.app` (or your real inbox you control) |
| Password | Strong unique password (save in 1Password) |
| Auto Confirm | Yes |

Then open the native app once, sign in, add a few tasks / one workout so the reviewer sees content.

Paste into App Store Connect → App Review Information → Notes (and Play if asked):

```
TrackIt is free with no in-app purchases.
Demo:
Email: review@trackit.app
Password: [YOUR_PASSWORD]
Account deletion: Settings → Account → Delete account
Privacy: https://track-it-umber-psi.vercel.app/privacy
Terms: https://track-it-umber-psi.vercel.app/terms
```

---

## 3. Screenshots & graphics

### iOS (App Store Connect)
Need at least one size per required device class. Capture from Simulator (`Cmd+S`) or device:

| Required | Size (portrait) |
|----------|-----------------|
| 6.7" (iPhone 15 Pro Max / 16 Plus class) | 1290 × 2796 |
| 6.5" (optional if Apple still asks) | 1284 × 2778 |

Suggested 5 screens (no Pro badges, no paywall):
1. Dashboard
2. Planner / tasks
3. Workout / Health
4. Analytics / stats
5. Settings (shows Delete account)

### Android (Play Console)
| Asset | Size |
|-------|------|
| Phone screenshots | ≥ 2 (≥ ≥ 320px, ≤ 3840px |
| Feature graphic | **1024 × 500** (required) |

Feature graphic tip: flat brand wordmark “TrackIt” on `#F3F5FA` / accent `#775DD8` — no fake UI cards claiming AI Coach.

---

## 4. Apple Privacy Nutrition Labels (App Store Connect)

Answer **Yes / linked to user / used for App Functionality** where you collect:

| Data type | Collect? | Notes |
|-----------|----------|--------|
| Email Address | Yes | Account |
| User ID | Yes | Account |
| Name / Username | Yes | Profile username |
| Health & Fitness (workouts, nutrition self-entry) | Yes | User-entered only — **not** HealthKit |
| Other User Content (tasks, journal, finance) | Yes | User content |
| Product Interaction / Crash | No (unless you add Analytics later) |
| Purchase History | **No** |
| Advertising Data / Tracking | **No** → Tracking = **No** |

Third parties to mention if asked: **Supabase** (hosting/auth). Do **not** list RevenueCat or Gemini for this free build.

---

## 5. Google Play Data Safety

**Does your app collect or share user data?** → Yes (collect), Share? typically **No** third-party “sale”; processors act as service providers.

| Category | Data | Collected | Shared | Purpose | Optional? |
|----------|------|-----------|--------|---------|-----------|
| Personal info | Email | Yes | No | App functionality, Account management | Required for account |
| Personal info | User IDs | Yes | No | App functionality | Required |
| Health & fitness | Exercise / nutrition info | Yes | No | App functionality | Optional features |
| Financial info | User payment info | **No** (no IAP) | — | — | — |
| App activity | In-app actions / other | Only if you store logs/tasks as content | No | App functionality | |
| Device IDs | **No** advertising ID | — | — | — | — |

- **Encrypted in transit:** Yes  
- **Users can request deletion:** Yes (in-app Settings → Delete account)  
- **Committed to Play Families:** No (13+)  
- **Data sold:** No  
- **Is app for children:** No  

Sensitive: mark health data accurately as **user-entered fitness**, not medical diagnosis.

---

## 6. Builds

```bash
# Android AAB → Play Console
npm run build:android

# iOS IPA → TestFlight (interactive Apple login once)
npx eas-cli@latest build --platform ios --profile production
npm run submit:ios
```

Play: upload AAB to Internal testing first.  
iOS: TestFlight internal → then Submit for Review.

---

## 7. Console must-haves (both)

- [ ] App name TrackIt, free price, **no** IAP products created  
- [ ] Privacy / Terms / Support URLs filled  
- [ ] Content rating / age rating questionnaires done  
- [ ] `delete-account` edge function deployed on production Supabase  
- [ ] EAS env has `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` for production  
