# Для посредника — iOS / версии (готово в репо)

**Дата:** 2026-08-11  
**Ветка:** `free-app`  
**Bundle ID:** `com.trackit.lifeos`

## Номера (уже проставлены в коде)

| Поле | Значение |
|------|----------|
| Version (CFBundleShortVersionString) | **1.0.1** |
| iOS Build (CFBundleVersion) | **6** |
| Android versionName | **1.0.1** (в app.json; AAB vc13 ещё на 1.0.0 — пересобрать при нужде) |
| Android versionCode | **13** (текущий готовый AAB) |

Менять version/build **не нужно** — Archive/Upload как есть.  
В App Store Connect создай/открой версию **1.0.1** (не 1.0.0).

## Android AAB

- Файл: `TrackIt-1.0.0-vc13.aab` (versionName 1.0.0 / code 13)
- Ссылка: https://expo.dev/artifacts/eas/Pnid2Z2XDTjomggSVoDZCCiNnrKTMUsVOCgvP24mDB0.aab

## iOS

1. `git clone` → `git checkout free-app` → `git pull` → `npm run setup:ios`
2. Signing → **ваша** Team
3. Product → Archive (Any iOS Device)
4. Distribute → App Store Connect → Upload
5. В Connect: версия **1.0.1**, билд **6** → Submit

Подписки:
- `trackit_pro_monthly`
- `trackit_pro_yearly`

Демо ревью: `review@trackit.app` / `trackit`

Биллинг: напрямую App Store / Play (`expo-iap`), без RevenueCat.
