# Для посредника — версии и product IDs

**Дата:** 2026-09-02  
**Ветка:** `free-app`  
**Bundle / Package:** `com.trackit.lifeos`

## Номера (в коде сейчас)

| Поле | Значение |
|------|----------|
| Marketing version | **2.0** |
| iOS Build (`buildNumber`) | **8** |
| Android `versionCode` | **31** |
| Android `versionName` | 1.0.3 в старых AAB-именах; marketing в app.json = **2.0** |

В App Store Connect: версия **2.0**, билд **8**.

## Product IDs

| План | App Store | Google Play |
|------|-----------|-------------|
| Monthly | `trackit_pro_monthly_v2` | `trackit_pro_monthly` |
| Yearly | `trackit_pro_yearly_v2` | `trackit_pro_yearly` |

На iOS старые id без `_v2` заняты non-subscription IAP — **не использовать**.  
На Android **только** id без `_v2`.

## Россия

Исключить **Russia** в Availability (App Store) и Countries (Play).

## iOS — минимум шагов

```bash
git checkout free-app && git pull
npm run setup:ios
# Xcode → Team → Archive → Upload
```

Демо: `review@trackit.app` / `trackit`
