# TrackIt — старт для публикатора (iOS)

Expo не нужен. После клона из Git выполните РОВНО это:

```bash
cd TrackIt
git checkout main
npm run setup:ios
```

Откроется Xcode на файле **TrackIt.xcworkspace**.

Дальше:
1. Signing & Capabilities → Team (ваш платный Apple Developer)
2. Bundle ID = `com.trackit.lifeos`
3. Устройство: Any iOS Device (arm64)
4. Product → Archive → Upload в App Store Connect

Полная инструкция: `store/handoff/FOR_PUBLISHER_RU.md`

## Частые ошибки

| Ошибка | Причина | Что сделать |
|--------|---------|-------------|
| `No such module 'Expo'` / `*.modulemap not found` | Открыли `.xcodeproj` или не сделали `pod install` | Закрыть Xcode → `npm run setup:ios` |
| `Supabase is not configured` | Старый IPA | `git pull` + новый Archive |
| Красный экран / Metro / `:8081` | Product → Run (Debug) | Нужен только Archive |

Не открывайте `TrackIt.xcodeproj`. Только `TrackIt.xcworkspace`.
