# Free TrackIt — TestFlight + Play Store submit

Branch: **`free-app`** (`APP_IS_FULLY_FREE = true`). No billing, all features unlocked.

## Review readiness (must be true before submit)

- [x] No paywall / no IAP UI for users
- [x] Privacy + Terms describe a **free** product (deployed on Vercel from this branch)
- [x] Account deletion in Settings
- [x] Age gate 13+ (email sign-up + Google/Apple)
- [x] Health disclaimer
- [x] Listing matches product (no AI Coach / accurate program count)
- [x] Sign in with Apple on iOS (required when Google exists)
- [ ] Demo account for reviewers created in Supabase Auth
- [ ] Screenshots + Play feature graphic uploaded
- [ ] App Store privacy nutrition labels + Play Data Safety filled (disclose Supabase)

Redeploy legal pages:

```bash
git checkout free-app
npm run export:web
# deploy dist/ to Vercel (or push free-app and point Vercel to this branch)
```

Deploy edge functions from `free-app` if using Telegram reminders:

```bash
supabase functions deploy tma-access
```

## Builds

### Android (Play — AAB)

```bash
git checkout free-app
npm run build:android
```

Upload the AAB in Play Console → Testing (internal) or Production.  
Sideload QA APK (optional): `npm run build:preview:android`.

### iOS (TestFlight)

Requires Apple Developer Program + one interactive credentials setup:

```bash
npx eas-cli@latest build --platform ios --profile production
```

EAS will ask to log in to Apple and create **App Store** distribution cert + provisioning profile.  
Then:

```bash
npm run submit:ios
```

Or in App Store Connect: TestFlight → add build → Internal / External testing → Submit for App Review.

## Console setup (free app)

**App Store Connect**
- Bundle ID `com.trackit`
- Price: Free
- **Do not** create subscription products for this build
- Paste Privacy / Terms / Support URLs from `store/LISTING.md`
- Paste App Review notes from `store/LISTING.md`

**Google Play Console**
- App `com.trackit`, free
- No paid products
- Data Safety: account data, health/fitness user-entered, cloud sync
- Content rating questionnaire

## Typical rejection causes (avoid)

| Risk | Fix on this branch |
|------|--------------------|
| Listing mentions Pro / paid IAP but app has none | Use free `store/LISTING.md` |
| Privacy/Terms still describe subscriptions | Redeploy `public/*.html` from `free-app` |
| Missing SIWA | Keep `expo-apple-authentication` |
| Incomplete demo login | Create `review@…` account before submit |
| Crash on cold start | Smoke-test TestFlight / internal track before review |
