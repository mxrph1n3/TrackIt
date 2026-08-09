# TrackIt — старт для публикатора (iOS + Android)

Репозиторий: https://github.com/mxrph1n3/TrackIt  
Ветка: **`main`** или **`free-app`** (одинаковый код)  
Package / Bundle ID: **`com.trackit.lifeos`**  
Версия: **1.0.0**

## Модель приложения (важно)

- **Не полностью бесплатное.** Есть подписка **TrackIt Pro** (~$5/мес, есть годовой план).
- На **iOS и Android**: soft-триал **3 дня** полного Pro, затем paywall.
- Product IDs: `trackit_pro_monthly`, `trackit_pro_yearly`
- Entitlement RevenueCat: **`pro`**
- В приложении языки: **English / Русский / Español / Deutsch** (Settings → Language или боковое меню).

Expo для повседневной работы **не обязателен**. Для стора — Xcode Archive (iOS) или EAS AAB (Android).

---

## iOS (Mac)

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
git pull
npm run setup:ios
```

Откроется **TrackIt.xcworkspace** → Signing → Team → **Product → Archive** → Upload.

Полная инструкция: [`store/handoff/FOR_PUBLISHER_RU.md`](store/handoff/FOR_PUBLISHER_RU.md)  
Чеклист листинга: [`store/handoff/RELEASE_READY_RU.md`](store/handoff/RELEASE_READY_RU.md)

| Ошибка | Что делать |
|--------|------------|
| `No such module 'Expo'` | Закрыть Xcode → `npm run setup:ios` (не `.xcodeproj`) |
| `Supabase is not configured` | `git pull` + новый Archive |
| `PhaseScriptExecution` / `EPERM` | Уже `ENABLE_USER_SCRIPT_SANDBOXING = NO`; Clean + Archive |
| Красный экран / `:8081` | Это Debug Run — нужен только **Archive** |

---

## Android (Google Play)

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
git pull
npm install
npm run build:android
```

Или загрузите готовый **AAB** от владельца.  
Полная инструкция: [`store/handoff/FOR_PUBLISHER_ANDROID_RU.md`](store/handoff/FOR_PUBLISHER_ANDROID_RU.md)

В Play Console обязательно создать подписки с ID выше и привязать к релизу.

---

## Что заполняется в сторах (не в Xcode)

Название, описание, keywords, скриншоты, Privacy, IAP — в **App Store Connect** / **Play Console**.  
Готовые тексты (EN + RU + ES + DE): `store.config.json` и `RELEASE_READY_RU.md`.

Скриншоты: `store/handoff/screenshots/`  
Иконка: `store/handoff/app-icon-1024.png`

---

## Демо для ревью

| | |
|--|--|
| Email | `review@trackit.app` |
| Password | `trackit` |

Аккаунт должен существовать в Supabase.  
В Review notes указать: 3-дневный soft-trial Pro, затем подписка; вход только email/пароль.

Контакт владельца: mxrphin3work@gmail.com
