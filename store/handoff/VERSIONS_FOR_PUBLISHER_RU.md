# Для посредника — iOS / версии (готово в репо)

**Дата:** 2026-08-12  
**Ветка:** `free-app`  
**Bundle ID:** `com.trackit.lifeos`

## Номера (уже проставлены в коде)

| Поле | Значение |
|------|----------|
| Version | **1.0.1** |
| iOS Build | **7** |
| Android versionCode | **13** (текущий AAB; для `_v2` продуктов нужна новая Android-сборка) |

В App Store Connect: версия **1.0.1**, билд **7**.

## Product IDs (подписки, не обычные IAP)

| План | Product ID |
|------|------------|
| Monthly | `trackit_pro_monthly_v2` |
| Yearly | `trackit_pro_yearly_v2` |

Старые `trackit_pro_monthly` / `yearly` заняты обычными IAP — **не использовать**.

## iOS

1. `git checkout free-app && git pull && npm run setup:ios`
2. Signing → ваша Team
3. Archive → Upload
4. Подписки создать как Auto-Renewable с ID выше
5. Submit версии 1.0.1 / build 7

Демо: `review@trackit.app` / `trackit`
