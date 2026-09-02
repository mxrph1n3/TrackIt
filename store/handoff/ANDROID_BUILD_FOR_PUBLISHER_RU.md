# Android AAB для посредника

**Дата:** 2026-09-02  
**Package:** `com.trackit.lifeos`  
**Ветка:** `free-app`  
**versionCode:** **31** (актуальный production)

## Сборка

Предпочтительно взять готовый AAB у владельца:  
`dist-android/publisher/TrackIt-1.0.3-vc31.aab` (не в git).

Или собрать:

```bash
git checkout free-app && git pull && npm install
npx --yes eas-cli build --platform android --profile production
```

Передать посреднику:
1. Файл `.aab` (versionCode ≥ 31)
2. `store/handoff/FOR_PUBLISHER_ANDROID_RU.md`
3. `store/handoff/RELEASE_READY_RU.md`
4. Репо: https://github.com/mxrph1n3/TrackIt (`free-app`)

## Что внутри

- Paid Pro + soft-trial 3 дня
- i18n EN / RU / ES / DE
- Биллинг: Play Billing (`expo-iap`), без RevenueCat
- Product IDs: `trackit_pro_monthly` / `trackit_pro_yearly` (**без** `_v2`)
- Блок storefront Russia в приложении

## Play Console

1. Загрузить AAB в Internal testing / Production.
2. Подписки Active: `trackit_pro_monthly`, `trackit_pro_yearly`.
3. **Countries → exclude Russia.**
4. Data Safety + Privacy URL из `RELEASE_READY_RU.md`.
