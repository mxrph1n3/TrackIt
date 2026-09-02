# TrackIt — старт для публикатора (iOS + Android)

**Репозиторий:** https://github.com/mxrph1n3/TrackIt  
**Ветка:** **`free-app`** (актуальный код; не `main`)  
**Package / Bundle ID:** `com.trackit.lifeos`  
**Версия приложения:** **2.0** · iOS build **8** · Android versionCode **31**

## Модель

- Free download + подписка **TrackIt Pro**
- Soft-trial **3 дня** Pro на устройстве, затем paywall
- Биллинг: **только** App Store / Google Play (`expo-iap`), **без RevenueCat**
- Языки UI: EN / RU / ES / DE

### Product IDs (разные на платформах!)

| | Monthly | Yearly |
|--|---------|--------|
| **App Store** | `trackit_pro_monthly_v2` | `trackit_pro_yearly_v2` |
| **Google Play** | `trackit_pro_monthly` | `trackit_pro_yearly` |

На Android **нельзя** `_v2`. На iOS **только** `_v2`.

### Россия — оплаты запрещены

1. App Store Connect → Pricing and Availability → **исключить Russia**
2. Google Play → Countries → **исключить Russia**
3. В коде уже есть блок storefront `RU`/`RUS` — Console всё равно обязателен

---

## iOS (Mac) — сборка и загрузка

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout free-app
git pull
npm run setup:ios
```

Откроется **`TrackIt.xcworkspace`** (не `.xcodeproj`).

1. Signing & Capabilities → Team (платный Apple Developer)  
2. Bundle ID = `com.trackit.lifeos`  
3. Схема **TrackIt** · устройство **Any iOS Device (arm64)**  
4. **Product → Archive** (не Run)  
5. Organizer → Distribute App → App Store Connect → Upload  

Полная инструкция: [`store/handoff/FOR_PUBLISHER_RU.md`](store/handoff/FOR_PUBLISHER_RU.md)

| Ошибка | Что делать |
|--------|------------|
| `No such module 'Expo'` | Закрыть Xcode → `npm run setup:ios` |
| `Supabase is not configured` | `git pull` на `free-app` + новый Archive |
| Красный экран / `:8081` | Это Debug Run — нужен только **Archive** |

### Или EAS (облако)

```bash
git checkout free-app && git pull && npm install
npx --yes eas-cli login
npx --yes eas-cli build --platform ios --profile production
npx --yes eas-cli submit --platform ios --profile production --latest
```

---

## Android (Google Play)

Готовый AAB от владельца (предпочтительно):  
`TrackIt-1.0.3-vc31.aab` / versionCode **31**

Или сборка:

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout free-app
git pull
npm install
npx --yes eas-cli login
npx --yes eas-cli build --platform android --profile production
```

Подписки в Play: **`trackit_pro_monthly`** / **`trackit_pro_yearly`** (без `_v2`), base plans Active.  
Инструкция: [`store/handoff/FOR_PUBLISHER_ANDROID_RU.md`](store/handoff/FOR_PUBLISHER_ANDROID_RU.md)

---

## App Store Connect / Play — не в Xcode

Листинг, скриншоты, Privacy, IAP:  
[`store/handoff/RELEASE_READY_RU.md`](store/handoff/RELEASE_READY_RU.md) · `store.config.json`

- Privacy: https://track-it-umber-psi.vercel.app/privacy  
- Terms: https://track-it-umber-psi.vercel.app/terms  
- Support: https://track-it-umber-psi.vercel.app/support  
- Скриншоты: `store/handoff/screenshots/`  
- Иконка: `store/handoff/app-icon-1024.png`

---

## Демо для ревью

| | |
|--|--|
| Email | `review@trackit.app` |
| Password | `trackit` |

В Review notes: 3-дневный soft-trial Pro, затем подписка; вход только email/пароль; IAP ids как в таблице выше.
