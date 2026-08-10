# Android AAB для посредника

**Дата:** 2026-08-10  
**Package:** `com.trackit.lifeos`  
**versionCode (EAS):** 12  

## Сборка (production AAB) — готово

| | |
|--|--|
| Status | **Finished** |
| versionName | 1.0.0 |
| versionCode | 12 |
| EAS page | https://expo.dev/accounts/s4d1sms-team/projects/sadism/builds/ea50c950-2089-45d5-85f4-956a719f129c |
| Download AAB | https://expo.dev/artifacts/eas/EMhoDiBf6HSNySlSrHf15f2qg1dNvYh_k-ibSmw3MDE.aab |
| Локальная копия | `dist-android/publisher/TrackIt-1.0.0-vc12.aab` (не в git) |

Передать посреднику:
1. Файл `.aab` (ссылка выше или локальная копия)
2. Документ `store/handoff/FOR_PUBLISHER_ANDROID_RU.md`
3. Листинг `store/handoff/RELEASE_READY_RU.md`
4. Репо: https://github.com/mxrph1n3/TrackIt (ветка `main`)

## Что внутри этой сборки

- Paid Pro + soft-trial 3 дня
- i18n EN / RU / ES / DE
- Фикс краша меню профиля (infinite re-render soft-trial)
- RevenueCat: в Release игнорируются `test_…` ключи (нужны `appl_` / `goog_` в EAS env)

## Play Console (напоминание)

1. Создать приложение `com.trackit.lifeos` (если ещё нет).
2. Загрузить этот AAB в Internal testing / Production.
3. Подписки:
   - `trackit_pro_monthly`
   - `trackit_pro_yearly`
4. Data Safety + Privacy Policy URL из `RELEASE_READY_RU.md`.

## Signing

AAB подписан **EAS remote keystore** (Expo).  
Если посредник хочет свой upload key — нужна отдельная переподпись / новый keystore; обычно для первого релиза достаточно этого AAB + Play App Signing.
