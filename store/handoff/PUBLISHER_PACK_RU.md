# TrackIt — что отдать посреднику (чеклист)

Соберите пакет из репозитория после `git pull` на `main` / `free-app`.

## Документы (обязательно)

| Файл | Зачем |
|------|--------|
| [`START_HERE_PUBLISHER_RU.md`](../../START_HERE_PUBLISHER_RU.md) | Точка входа iOS + Android |
| [`FOR_PUBLISHER_RU.md`](./FOR_PUBLISHER_RU.md) | iOS Archive / EAS |
| [`FOR_PUBLISHER_ANDROID_RU.md`](./FOR_PUBLISHER_ANDROID_RU.md) | Google Play / AAB / подписки |
| [`RELEASE_READY_RU.md`](./RELEASE_READY_RU.md) | Листинг, IAP, тексты EN/RU/ES/DE, ревью |
| [`INSTRUCTIONS_RU.md`](./INSTRUCTIONS_RU.md) | Краткий App Store Connect |
| [`XCODE_ARCHIVE.md`](./XCODE_ARCHIVE.md) | Пошаговый Archive |
| [`../../store.config.json`](../../store.config.json) | Метаданные для EAS metadata:push |

## Ассеты

| Актив | Путь |
|-------|------|
| Иконка 1024 | `store/handoff/app-icon-1024.png` |
| Скриншоты 6.9" | `store/handoff/screenshots/6.9-inch/` |
| Скриншоты 6.5" | `store/handoff/screenshots/6.5-inch/` |
| Feature graphic (Android) | `store/feature-graphic.png` |

## Ключевые факты для письма посреднику

```
Репо: https://github.com/mxrph1n3/TrackIt
Ветка: main (или free-app)
Bundle/Package: com.trackit.lifeos
Версия: 1.0.0

Модель: free download + TrackIt Pro subscription
Products: trackit_pro_monthly_v2, trackit_pro_yearly_v2 (~$5/mo, ~$50/yr)
Soft trial: 3 days full Pro
Languages in app: EN, RU, ES, DE

iOS: npm run setup:ios → Archive (см. START_HERE_PUBLISHER_RU.md)
Android: npm run build:android → AAB (см. FOR_PUBLISHER_ANDROID_RU.md)

Demo review: review@trackit.app / trackit
Support: mxrphin3work@gmail.com
Privacy: https://track-it-umber-psi.vercel.app/privacy
```

## Важно для владельца перед передачей

1. **Закоммитить и запушить** текущий код (i18n + paid billing) — иначе посредник соберёт старую free-версию.  
2. Проверить демо-аккаунт в Supabase.  
3. Подставить телефон E.164 в `store.config.json` → `apple.review.phone`.  
4. Убедиться, что в EAS / env есть RevenueCat keys (`appl_…`, `goog_…`).  
5. Paid Apps Agreement (Apple) и Play payments profile активны у публикатора.
