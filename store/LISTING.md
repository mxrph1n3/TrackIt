# TrackIt — Store listing (fully free build)

Use with the **`free-app`** branch for App Store Connect and Google Play.  
This build has **no in-app purchases and no subscriptions**.

**Bundle / package:** `com.trackit`  
**Privacy:** https://track-it-umber-psi.vercel.app/privacy  
**Terms:** https://track-it-umber-psi.vercel.app/terms  
**Support:** support@trackit.app

> Before submit: redeploy the web host from `free-app` so Privacy/Terms match this free build (no subscription claims).

---

## App Store

**Name:** TrackIt  
**Subtitle (30 chars):** Tasks, health & habits OS  
**Primary category:** Health & Fitness  
**Secondary category:** Productivity  
**Price:** Free  
**In-App Purchases:** None

**Keywords (100 chars):** tasks,habits,workout,nutrition,finance,planner,fitness,tracker,streaks,gamification

**Promotional text (170 chars, optional):**  
One free app for tasks, workouts, nutrition, finance, and habits — with XP and streaks.

**Description:**

TrackIt is your daily command center: plan tasks, train with structured programs, log meals and water, track spending, and build habits — all synced in the cloud. **TrackIt is completely free** with all features unlocked.

**What you can do**
- Planner with tasks, subtasks, and focus sessions
- Structured workout programs (maintenance, fat loss, mass gain) plus custom programs
- Nutrition targets from your profile (BMR/TDEE estimates)
- Finance overview, subscriptions tracker, and insights
- Habits, journal, and gamification (XP, levels, leaderboard)
- Smart reminders (optional; enable in Settings)

Health features are for general wellness only — not medical or financial advice.

---

## Google Play

**Short description (80 chars):**  
Free life OS — tasks, workouts, nutrition, finance, and habits.

**Full description:** Use the App Store description above (Play allows up to 4000 chars).

**Category:** Health & Fitness  
**Price:** Free  
**Monetization:** None (no paid content / no subscriptions)

---

## App Review notes (both stores)

**Demo account (create before submit):**
- Email: `review@trackit.app` (or a dedicated tester you create in Supabase Auth)
- Password: [set in App Store Connect / share securely]

**Notes for reviewer:**
```
TrackIt is a free app with no in-app purchases or subscriptions.
All features (analytics, workouts, reminders) are unlocked for every signed-in user.

Sign in: email, Google, or Sign in with Apple (iOS).
Account deletion: Settings → Account → Delete account.
Push notifications: optional (Settings → Notifications).

Demo account:
Email: review@trackit.app
Password: [YOUR_DEMO_PASSWORD]

Privacy: https://track-it-umber-psi.vercel.app/privacy
Terms: https://track-it-umber-psi.vercel.app/terms
```

**Do not** set up App Store / Play subscription products for this free build. Leave IAP empty in both consoles.

---

## Assets checklist

| Asset | Size | Status |
|-------|------|--------|
| App icon | 1024×1024 | ✅ `assets/icon-light.png` |
| Phone screenshots | 6.7" / 6.5" (iOS), phone (Android) | ☐ Capture from device |
| Feature graphic (Play) | 1024×500 | ✅ `store/feature-graphic.png` |
| Tablet screenshots | Optional | ☐ |

---

## Builds (EAS, branch `free-app`)

| Platform | Profile | Artifact | Command |
|----------|---------|----------|---------|
| Android | `production` | **AAB** (Play) | `npm run build:android` |
| Android | `preview` | APK (sideload QA) | `npm run build:preview:android` |
| iOS | `production` | IPA → TestFlight | `npm run build:ios` (needs Apple credentials once) |

Submit after green builds:

```bash
npm run submit:ios      # → App Store Connect / TestFlight
npm run submit:android  # → Play Console (needs service account JSON)
```
