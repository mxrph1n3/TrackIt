# TrackIt — готовый пакет к выпуску (App Store + Google Play)

Одно окно для публикатора: билд, монетизация, тексты листинга (EN/RU/ES/DE), ревью.

**Старт:** [`../../START_HERE_PUBLISHER_RU.md`](../../START_HERE_PUBLISHER_RU.md)  
**iOS:** [`FOR_PUBLISHER_RU.md`](./FOR_PUBLISHER_RU.md) · [`XCODE_ARCHIVE.md`](./XCODE_ARCHIVE.md)  
**Android:** [`FOR_PUBLISHER_ANDROID_RU.md`](./FOR_PUBLISHER_ANDROID_RU.md)  
**Машинный файл:** [`../../store.config.json`](../../store.config.json)

---

## Модель (не путать со старым «fully free»)

| | |
|--|--|
| Тип | Free download + **auto-renewable subscription** |
| Soft-trial | **3 дня** полного Pro (в приложении, iOS + Android) |
| Products | `trackit_pro_monthly` · `trackit_pro_yearly` |
| Цена (fallback) | **$5.00 / month** · **$50 / year** |
| Billing | Direct App Store / Play Billing (`expo-iap`) |
| UI languages | English, Русский, Español, Deutsch |

В сторах приложение остаётся **Free** (цена загрузки 0), монетизация — через IAP/Subscriptions.

---

## Уже вшито в билд

| Поле | Значение |
|------|----------|
| Display Name | TrackIt |
| Bundle / Package | `com.trackit.lifeos` |
| Version | **1.0.0** |
| iOS Build | **5** |
| Android versionCode | **13** (AAB готов) |
| Encryption export (iOS) | `ITSAppUsesNonExemptEncryption = false` |
| Billing flags | `IOS_BILLING_ENABLED` / `ANDROID_BILLING_ENABLED` = **true** |

---

## Создать приложение

### App Store Connect

| Поле | Значение |
|------|----------|
| Platforms | iOS |
| Name | TrackIt |
| Primary language | English (U.S.) |
| Bundle ID | com.trackit.lifeos |
| SKU | trackit-lifeos-001 |

Дополнительно загрузить локали: **Russian**, **Spanish**, **German** (тексты ниже / `store.config.json`).

### Google Play

| Поле | Значение |
|------|----------|
| App name | TrackIt |
| Package | com.trackit.lifeos |
| Default language | English (United States) |
| Category | Health & Fitness |

---

## In-App Purchases / Subscriptions (обязательно)

Создать **до** или сразу после первого билда:

| Product ID | Тип | Ориентир цены |
|------------|-----|----------------|
| `trackit_pro_monthly` | Auto-renewable | $4.99–5.00 / month |
| `trackit_pro_yearly` | Auto-renewable | $49.99–50 / year |

Подписочная группа: например **TrackIt Pro**.  
Без RevenueCat — только native store IAP.

---

## App Information / листинг

| Поле | EN | |
|------|----|--|
| Subtitle (≤30) | Tasks, health & habits OS | |
| Primary Category | Health & Fitness | |
| Secondary | Productivity | |
| Age | **4+** / Play: Everyone (или по анкете) | |
| Price (download) | Free | |

**Privacy Policy:** https://track-it-umber-psi.vercel.app/privacy  
**Terms:** https://track-it-umber-psi.vercel.app/terms  
**Support:** https://track-it-umber-psi.vercel.app/support  
**Marketing:** https://track-it-umber-psi.vercel.app  

---

## Тексты — English (U.S.)

**Promotional text:**
```
Plan tasks, train, eat, budget, and build habits — with a 3-day Pro trial, then TrackIt Pro.
```

**Description:**
```
TrackIt is your daily command center: plan tasks, train with structured programs, log meals and water, track spending, and build habits — all synced in the cloud.

Start with a 3-day Pro trial (full access). After the trial, unlock TrackIt Pro with an auto-renewable subscription to keep advanced programs, analytics, reminders, and premium themes.

What you can do
- Planner with tasks, subtasks, and focus sessions
- Structured workout programs (maintenance, fat loss, mass gain) plus custom programs
- Nutrition targets from your profile (BMR/TDEE estimates)
- Finance overview, subscriptions tracker, and insights
- Habits, journal, and gamification (XP, levels, leaderboard)
- Smart reminders (optional; enable in Settings)
- App language: English, Russian, Spanish, German (Settings → Language)

Health features are for general wellness only — not medical or financial advice.
Subscriptions are billed through your Apple ID / Google Play account and renew automatically unless cancelled at least 24 hours before the end of the period.
```

**Keywords (≤100):**
```
tasks,habits,workout,nutrition,finance,planner,fitness,tracker,streaks,pro
```

**What’s New:**
```
Initial release. Includes a 3-day Pro trial, then TrackIt Pro subscription. Languages: English, Russian, Spanish, German.
```

---

## Тексты — Русский

**Subtitle:** Задачи, здоровье и привычки  

**Promotional:**
```
Задачи, тренировки, питание и финансы — 3 дня Pro, затем подписка TrackIt Pro.
```

**Description:**
```
TrackIt — ежедневный центр управления: задачи, тренировки, питание, финансы и привычки в одном приложении с облачной синхронизацией.

Первые 3 дня — полный доступ Pro. Дальше оформите подписку TrackIt Pro, чтобы сохранить программы, аналитику, напоминания и премиум-темы.

Возможности
- Планировщик: задачи, подзадачи, фокус-сессии
- Программы тренировок и свои программы
- Цели по питанию (оценка BMR/TDEE)
- Финансы, подписки и инсайты
- Привычки, дневник, XP и уровни
- Умные напоминания (по желанию в Настройках)
- Язык: русский, English, Español, Deutsch (Настройки → Язык)

Функции здоровья — для общего wellness, не медицинский и не финансовый совет.
Подписка списывается через App Store / Google Play и продлевается автоматически, если не отменить минимум за 24 часа до конца периода.
```

**What’s New:**
```
Первый релиз. 3 дня Pro-триала, затем подписка TrackIt Pro. Языки: RU, EN, ES, DE.
```

---

## Тексты — Español

**Subtitle:** Tareas, salud y hábitos  

**Promotional:**
```
Tareas, entreno, nutrición y finanzas — 3 días Pro, luego suscripción TrackIt Pro.
```

**Description:**
```
TrackIt es tu centro de mando diario: tareas, entrenamientos, comidas, gastos y hábitos, con sincronización en la nube.

Prueba Pro de 3 días con acceso completo. Después, suscríbete a TrackIt Pro para mantener programas, analítica, recordatorios y temas premium.

Qué puedes hacer
- Planner con tareas, subtareas y modo Focus
- Programas de entrenamiento y programas propios
- Objetivos de nutrición (estimación BMR/TDEE)
- Finanzas, suscripciones e insights
- Hábitos, diario y gamificación (XP, niveles)
- Recordatorios opcionales (Ajustes)
- Idioma: español, inglés, ruso, alemán (Ajustes → Idioma)

Las funciones de salud son de bienestar general, no consejo médico ni financiero.
La suscripción se cobra con tu cuenta de Apple / Google Play y se renueva sola salvo cancelación al menos 24 h antes del fin del periodo.
```

---

## Тексты — Deutsch

**Subtitle:** Tasks, Health & Habits  

**Promotional:**
```
Tasks, Training, Ernährung & Finanzen — 3 Tage Pro, danach TrackIt-Pro-Abo.
```

**Description:**
```
TrackIt ist dein tägliches Command Center: Tasks, Workouts, Ernährung, Finanzen und Habits — mit Cloud-Sync.

3 Tage Pro-Test mit vollem Zugriff. Danach TrackIt Pro abonnieren, um Programme, Analysen, Reminder und Premium-Themes zu behalten.

Funktionen
- Planner mit Tasks, Subtasks und Focus
- Trainingsprogramme und eigene Programme
- Ernährungsziele (BMR/TDEE-Schätzung)
- Finanzen, Abos und Insights
- Habits, Journal und Gamification (XP, Level)
- Optionale Reminder (Einstellungen)
- Sprache: Deutsch, English, Русский, Español (Einstellungen → Sprache)

Health-Funktionen dienen dem allgemeinen Wellness — keine medizinische oder Finanzberatung.
Das Abo wird über Apple ID / Google Play abgerechnet und verlängert sich automatisch, sofern es nicht mindestens 24 Stunden vor Periodenende gekündigt wird.
```

---

## Скриншоты и иконка

| Актив | Путь |
|-------|------|
| App icon 1024×1024 | `store/handoff/app-icon-1024.png` |
| iPhone 6.9" | `store/handoff/screenshots/6.9-inch/` → 01…06 |
| iPhone 6.5" | `store/handoff/screenshots/6.5-inch/` → 01…06 |
| Android phone | те же 01…06 (+ `store/feature-graphic.png` если есть) |

Порядок: dashboard → planner → workouts → nutrition → finance → analytics.

---

## App Privacy (iOS labels) / Play Data safety

- Tracking you: **No**
- Linked to you: Contact (email), Health & Fitness, User Content, User ID — App Functionality
- Third-party advertising: **No**

---

## App Review / Play review

| | |
|--|--|
| Demo email | `review@trackit.app` |
| Demo password | `trackit` |
| Contact | mxrphin3work@gmail.com |
| Phone | подставить E.164 в `store.config.json` → `apple.review.phone` |

**Review notes:**
```
TrackIt includes a 3-day soft trial with full Pro access on first launch (iOS/Android).
After the trial, Pro features require an auto-renewable subscription:
trackit_pro_monthly / trackit_pro_yearly (App Store / Google Play).

Sign in: email and password only (no Google / Apple Sign-In).
Account deletion: Settings → Account → Delete account.
Push: opt-in only — enable Smart reminders in Settings.

In-app languages: English, Russian, Spanish, German (Settings → Language).

Privacy: https://track-it-umber-psi.vercel.app/privacy
Terms: https://track-it-umber-psi.vercel.app/terms
```

---

## Чеклист Submit

### iOS
- [ ] App создан, Bundle ID `com.trackit.lifeos`
- [ ] Подписки `trackit_pro_monthly` / `yearly` созданы и в Review
- [ ] Paid Apps Agreement + banking/tax OK
- [ ] Локали EN (+ RU/ES/DE по возможности)
- [ ] Скриншоты 6.9" (6 шт.)
- [ ] Privacy labels
- [ ] Билд выбран, Export Compliance = No
- [ ] Demo login в Review Information
- [ ] Submit for Review

### Android
- [ ] App `com.trackit.lifeos`
- [ ] Подписки созданы и активны
- [ ] AAB загружен (internal → production)
- [ ] Листинг + Data safety
- [ ] Feature graphic / screenshots
- [ ] Content rating questionnaire
- [ ] Send for review

Контакт владельца: mxrphin3work@gmail.com
