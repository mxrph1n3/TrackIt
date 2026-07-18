# TrackIt — готовый пакет к выпуску (App Store)

Одно окно: что уже вшито в билд, что заполняется в App Store Connect, и в каком порядке отдавать публикатору.

---

## Важно: что НЕ живёт в IPA

В Xcode **нет** полей «категория / описание / keywords» для стора.  
Это метаданные **App Store Connect** (браузер или `eas metadata:push`).

| Где | Что |
|-----|-----|
| **IPA / Xcode** | Display Name, Bundle ID, Version, Build, иконка, entitlements, encryption flag |
| **App Store Connect** | Name, Subtitle, Category, Description, Keywords, Screenshots, Privacy, Age Rating, Review notes |

Готовый текст для Connect уже лежит в корне репо: **`store.config.json`**  
(и ниже — те же значения для ручного копирования).

---

## Уже вшито в билд (проверено)

| Поле | Значение |
|------|----------|
| Display Name (на домашнем экране) | **TrackIt** |
| Bundle ID | **com.trackit.lifeos** |
| Version (CFBundleShortVersionString) | **1.0.0** |
| Build (CFBundleVersion) | **1** |
| Category hint (Info.plist) | Health & Fitness (`public.app-category.healthcare-fitness`) |
| Encryption export | `ITSAppUsesNonExemptEncryption = false` |
| Sign in with Apple | entitlements включены |
| Push | `aps-environment = production` |
| Цена / IAP в бинарнике | нет покупок (fully free) |

Unsigned IPA (локально, если собирали): `dist-ios/TrackIt-unsigned.ipa`  
Публикатор всё равно должен **переподписать** своим Apple Developer Team (или собрать заново через EAS / Archive).

---

## Создать приложение в App Store Connect

| Поле | Значение |
|------|----------|
| Platforms | iOS |
| Name | TrackIt |
| Primary language | English (U.S.) |
| Bundle ID | com.trackit.lifeos |
| SKU | trackit-lifeos-001 |
| User Access | Full Access |

---

## App Information

| Поле | Значение |
|------|----------|
| Name | TrackIt |
| Subtitle (≤30) | Tasks, health & habits OS |
| Primary Category | **Health & Fitness** |
| Secondary Category | **Productivity** |
| Content Rights | Does not contain third-party content (или по факту) |
| Age Rating | анкета все None → **4+** (см. `store.config.json` → `advisory`) |
| Price | Free (0) |
| In-App Purchases | **не создавать** |

**Privacy Policy URL:** https://track-it-umber-psi.vercel.app/privacy  
**License / Terms (если спросят):** https://track-it-umber-psi.vercel.app/terms

---

## Version 1.0.0 — What’s New / Description

**Promotional Text:**
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

**Keywords (одной строкой, ≤100 символов):**
```
tasks,habits,workout,nutrition,finance,planner,fitness,tracker,streaks,gamification
```

**Support URL:** https://track-it-umber-psi.vercel.app/support  
**Marketing URL:** https://track-it-umber-psi.vercel.app  

**What’s New:**
```
Initial release. TrackIt is completely free — all features unlocked, no in-app purchases.
```

---

## Скриншоты и иконка

| Актив | Путь |
|-------|------|
| App icon 1024×1024 | `store/handoff/app-icon-1024.png` |
| iPhone 6.9" (обязательно) | `store/handoff/screenshots/6.9-inch/` → 01…06 |
| iPhone 6.5" (если спросит) | `store/handoff/screenshots/6.5-inch/` → 01…06 |

Порядок загрузки: `01-dashboard` → `02-planner` → `03-workouts` → `04-nutrition` → `05-finance` → `06-analytics`.

---

## App Privacy (labels)

- Data used to track you: **No**
- Linked to you:
  - Contact Info → Email Address (App Functionality)
  - Health & Fitness → Fitness (App Functionality)
  - User Content → Other User Content (App Functionality)
  - Identifiers → User ID (App Functionality)
- Third-party advertising: **No**

---

## App Review

Перед submit владелец проекта передаёт публикатору:

1. **Телефон** контакта (E.164, например `+1…` / `+7…`) — заменить в `store.config.json` → `apple.review.phone`
2. **Пароль демо-аккаунта** — заменить `demoPassword` (логин: `review@trackit.app`)

**Review notes** (уже в `store.config.json`):
```
TrackIt is a free app with no in-app purchases or subscriptions.
All features (analytics, workouts, reminders) are unlocked for every signed-in user.

Sign in: email, Google, or Sign in with Apple (iOS).
Account deletion: Settings → Account → Delete account.
Push notifications: opt-in only — disabled by default; the OS permission prompt appears only after the user enables Smart reminders in Settings.

Privacy: https://track-it-umber-psi.vercel.app/privacy
Terms: https://track-it-umber-psi.vercel.app/terms
```

Contact email: mxrphin3work@gmail.com

---

## Как залить метаданные автоматически (после IPA в TestFlight)

1. Подставить телефон и demo password в `store.config.json`
2. Загрузить билд (EAS или Xcode Archive)
3. Когда билд обработан:

```bash
npx --yes eas-cli metadata:push
```

Либо вручную скопировать таблицы выше в App Store Connect.

---

## Чеклист «можно Submit for Review»

- [ ] App создан с Bundle ID `com.trackit.lifeos`
- [ ] Категории Health & Fitness + Productivity
- [ ] Описание / subtitle / keywords / URLs вставлены
- [ ] Скриншоты 6.9" загружены (6 шт.)
- [ ] Иконка 1024 загружена (если не из билда)
- [ ] Privacy labels заполнены
- [ ] Age Rating 4+
- [ ] Билд 1.0.0 (1) выбран в версии
- [ ] Export Compliance: uses non-exempt encryption = **No** (уже в Info.plist)
- [ ] Demo login/password указаны
- [ ] IAP / subscriptions **не** созданы
- [ ] Submit for Review

Контакты владельца: mxrphin3work@gmail.com  
Подробный Debug vs Archive: `FOR_PUBLISHER_RU.md`  
Archive пошагово: `XCODE_ARCHIVE.md`
