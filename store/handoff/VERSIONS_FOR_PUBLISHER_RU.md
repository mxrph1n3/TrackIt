# Для посредника — iOS / версии (готово в репо)

**Дата:** 2026-08-11  
**Ветка:** `free-app`  
**Bundle ID:** `com.trackit.lifeos`

## Номера (уже проставлены в коде)

| Поле | Значение |
|------|----------|
| Version (CFBundleShortVersionString) | **1.0.0** |
| iOS Build (CFBundleVersion) | **5** |
| Android versionName | **1.0.0** |
| Android versionCode | **13** (AAB уже собран) |

Менять version/build **не нужно** — Archive/Upload как есть.

## Android AAB

- Файл: `TrackIt-1.0.0-vc13.aab`
- Ссылка: https://expo.dev/artifacts/eas/Pnid2Z2XDTjomggSVoDZCCiNnrKTMUsVOCgvP24mDB0.aab

## iOS

1. `git clone` → `git checkout free-app` → `npm run setup:ios`
2. Signing → **ваша** Team
3. Product → Archive (Any iOS Device)
4. Distribute → App Store Connect → Upload
5. В Connect: версия **1.0.0**, билд **5** → Submit

Подписки (создаёт владелец контента / можно до Submit):
- `trackit_pro_monthly`
- `trackit_pro_yearly`

Демо ревью: `review@trackit.app` / `trackit`

Биллинг: напрямую App Store / Play (`expo-iap`), без RevenueCat.
