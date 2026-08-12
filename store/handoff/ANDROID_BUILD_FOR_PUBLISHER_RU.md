# Android AAB для посредника

**Дата:** 2026-08-10  
**Package:** `com.trackit.lifeos`  
**versionCode (EAS):** 13  

## Сборка (production AAB) — готово

| | |
|--|--|
| Status | **Finished** |
| versionName | 1.0.0 |
| versionCode | 13 |
| EAS page | https://expo.dev/accounts/s4d1sms-team/projects/sadism/builds/e4b7effd-1a1b-4b17-bf90-38d152fd542d |
| Download AAB | https://expo.dev/artifacts/eas/Pnid2Z2XDTjomggSVoDZCCiNnrKTMUsVOCgvP24mDB0.aab |
| Локальная копия | `dist-android/publisher/TrackIt-1.0.0-vc13.aab` (не в git) |

Передать посреднику:
1. Файл `.aab` (ссылка выше или локальная копия)
2. Документ `store/handoff/FOR_PUBLISHER_ANDROID_RU.md`
3. Листинг `store/handoff/RELEASE_READY_RU.md`
4. Репо: https://github.com/mxrph1n3/TrackIt (ветка `free-app`)

## Что внутри этой сборки

- Paid Pro + soft-trial 3 дня
- i18n EN / RU / ES / DE
- Биллинг: Google Play Billing напрямую (`expo-iap`), без RevenueCat
- Product IDs: `trackit_pro_monthly_v2` / `trackit_pro_yearly_v2`

## Play Console

1. Создать приложение `com.trackit.lifeos` (если ещё нет).
2. Загрузить этот AAB в Internal testing / Production.
3. Подписки:
   - `trackit_pro_monthly_v2`
   - `trackit_pro_yearly_v2`
4. Data Safety + Privacy Policy URL из `RELEASE_READY_RU.md`.

## Signing

AAB подписан **EAS remote keystore** (Expo).  
Если посредник хочет свой upload key — нужна отдельная переподпись / новый keystore; обычно для первого релиза достаточно этого AAB + Play App Signing.
