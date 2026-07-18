# TrackIt — пакет для публикации в App Store

Всё, что нужно для создания приложения в App Store Connect и отправки на ревью.

**Сводный чеклист «готово к выпуску»:** [`RELEASE_READY_RU.md`](./RELEASE_READY_RU.md)  
**Машинный листинг (EAS Metadata):** [`../../store.config.json`](../../store.config.json)

> Категория / subtitle / description **не задаются в Xcode** — только в App Store Connect.

## Сборка IPA (выберите один путь)

### Рекомендуется: Xcode Archive (пара кликов)

Готовый нативный проект лежит в репозитории (`ios/`, bundle ID `com.trackit.lifeos`).

Пошагово: **[`XCODE_ARCHIVE.md`](./XCODE_ARCHIVE.md)**

Кратко:
```bash
git clone https://github.com/mxrph1n3/TrackIt.git && cd TrackIt
git checkout main && npm install
npm run ios:xcode
```
В Xcode: Team → **Product → Archive** → **Distribute App → App Store Connect**.

### Альтернатива: EAS (облако)

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production --latest
```

Или передайте владельцу проекта App Store Connect API Key (`.p8` + Key ID + Issuer ID + Team ID) — он соберёт и загрузит сам.

---

## 1. Создать приложение

App Store Connect → My Apps → «+» → New App:

| Поле | Значение |
|------|----------|
| Platform | iOS |
| Name | **TrackIt** |
| Primary language | English (U.S.) |
| Bundle ID | **com.trackit.lifeos** (сначала зарегистрировать на developer.apple.com → Identifiers, если не появился автоматически после загрузки билда) |
| SKU | trackit-lifeos-001 |

---

## 2. Метаданные (вкладка App Information / версия 1.0)

| Поле | Значение |
|------|----------|
| Subtitle | Tasks, health & habits OS |
| Primary category | Health & Fitness |
| Secondary category | Productivity |
| Price | Free (0 USD) |
| In-App Purchases | НЕ создавать — их нет |
| Privacy Policy URL | https://track-it-umber-psi.vercel.app/privacy |
| Support URL | https://track-it-umber-psi.vercel.app/support |

**Keywords:**
```
tasks,habits,workout,nutrition,finance,planner,fitness,tracker,streaks,gamification
```

**Promotional text:**
```
One free app for tasks, workouts, nutrition, finance, and habits — with XP and streaks.
```

**Description:**
```
TrackIt is your daily command center: plan tasks, train with structured programs, log meals and water, track spending, and build habits — all synced in the cloud. TrackIt is completely free with all features unlocked.

What you can do
- Planner with tasks, subtasks, and focus sessions
- Structured workout programs (maintenance, fat loss, mass gain) plus custom programs
- Nutrition targets from your profile (BMR/TDEE estimates)
- Finance overview, subscriptions tracker, and insights
- Habits, journal, and gamification (XP, levels, leaderboard)
- Smart reminders (optional; enable in Settings)

Health features are for general wellness only — not medical or financial advice.
```

---

## 3. Скриншоты

Папка `screenshots/`:

- `6.9-inch/` — 1320×2868 (iPhone 6.9") — обязательный набор, 6 штук, загружать по порядку 01→06
- `6.5-inch/` — 1284×2778 (iPhone 6.5") — опционально (генерируется из 6.9" автоматически, но можно загрузить свои)

iPad-скриншоты не нужны (`supportsTablet: false`).

---

## 4. App Privacy (privacy labels)

Раздел App Privacy → Get Started. Ответы:

- **Data used to track you:** No / ничего
- **Data linked to you:**
  - Contact Info → Email Address (аутентификация)
  - Health & Fitness → Fitness (самостоятельно вводимые тренировки/питание)
  - User Content → Other User Content (задачи, привычки, журнал, финансы)
  - Identifiers → User ID
- **Data not linked to you:** ничего
- Цель для всех: App Functionality. Third-party advertising: No.

---

## 5. Age Rating

Анкета возрастного рейтинга — все ответы «None/No». Итог: **4+**.

---

## 6. App Review Information

- **Sign-in required:** Yes → указать демо-аккаунт (логин/пароль передаст владелец проекта отдельно, безопасным каналом)
- **Notes:**
```
TrackIt is a free app with no in-app purchases or subscriptions.
All features (analytics, workouts, reminders) are unlocked for every signed-in user.

Sign in: email, Google, or Sign in with Apple (iOS).
Account deletion: Settings → Account → Delete account.
Push notifications: opt-in only — disabled by default; the OS permission prompt appears only after the user enables "Smart reminders" in Settings.

Privacy: https://track-it-umber-psi.vercel.app/privacy
Terms: https://track-it-umber-psi.vercel.app/terms
```

---

## 7. Отправка

1. Дождаться, пока билд появится в TestFlight (обработка ~10–30 мин после загрузки).
2. Version → Build → выбрать загруженный билд.
3. Export Compliance: билд уже содержит `ITSAppUsesNonExemptEncryption = false` — вопросов быть не должно; если спросит, ответ «None of the algorithms mentioned above» / not encryption.
4. **Submit for Review.**

Вопросы: mxrphin3work@gmail.com
