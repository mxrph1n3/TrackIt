# TrackIt — инструкция для публикатора (iOS App Store)

**Кому:** тому, кто загружает приложение в App Store Connect  
**Репозиторий:** https://github.com/mxrph1n3/TrackIt  
**Ветка:** `main` или `free-app` (одинаковый код для стора)  
**Bundle ID:** `com.trackit.lifeos`  
**Имя приложения:** TrackIt  

**Expo / EAS не обязательны.** Достаточно Mac + Xcode + Node + CocoaPods.

---

## Обязательно после клона (иначе Xcode красный)

В Git **нет** `node_modules/` и `ios/Pods/`. Без установки будут ошибки вроде:

- `No such module 'Expo'`
- `*.modulemap not found`
- `SwiftGeneratePch` / `PrecompileSwiftBridgingHeader`

### Одна команда

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
npm run setup:ios
```

Скрипт сделает `npm install` + `pod install` и откроет **`TrackIt.xcworkspace`**.

### Или вручную

```bash
npm install
cd ios && pod install && cd ..
open ios/TrackIt.xcworkspace
```

| Правильно | Неправильно |
|-----------|-------------|
| `TrackIt.xcworkspace` | `TrackIt.xcodeproj` |
| Product → **Archive** | Product → Run (Debug) на телефон |

Нужны: **Node.js 20+**, **CocoaPods** (`brew install cocoapods`), **Xcode**.

Если снова `modulemap not found`: закройте Xcode → в терминале `rm -rf ~/Library/Developer/Xcode/DerivedData/TrackIt-*` → снова `npm run setup:ios`.

**Supabase / логин:** ключи уже в репо (`.env.production`). Отдельный `.env` не нужен. После обновления кода — **новый Archive**.

---

## Сначала прочитайте это (про Debug Run)

Сообщения вроде:

- `No script URL provided. Make sure the packager is running...`
- `Local network prohibited` / `Code=-1009` к `http://10.0.0.4:8081`
- `empty dSYM` / `UIScene lifecycle`

означают: запущен **Debug Run**, а не Archive. Для стора — только **Product → Archive**.

| Что вы делали | Что получается |
|---------------|----------------|
| Xcode → Run (Debug) | Нужен Metro → ошибки сети |
| **Xcode Archive** | Готовый IPA для стора |

---

## Что нужно иметь

1. Mac с Xcode.  
2. **Платный Apple Developer** ($99/год).  
3. Node.js 20+ и CocoaPods.  
4. Доступ к GitHub TrackIt.  

---

# Путь A (опционально) — EAS в облаке (нужен Expo-аккаунт)

Так вы получаете **настоящий IPA** без Metro и без Debug Run.

## A1. Клонировать и поставить зависимости

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout free-app
npm install
```

## A2. Войти в Expo

```bash
npx --yes eas-cli login
```

(аккаунт Expo — можно бесплатный; Apple Developer — отдельно, свой)

Если проект чужой и `eas` ругается на projectId — один раз:

```bash
npx --yes eas-cli init
```

## A3. Собрать production IPA

```bash
npx --yes eas-cli build --platform ios --profile production
```

На вопросы отвечать так:

1. **Log in to Apple Developer account?** → **Yes** → ваш Apple ID + код 2FA  
2. **Generate a new Apple Distribution Certificate?** → **Yes**  
3. **Generate a new Provisioning Profile?** → **Yes**  

Ждать **15–25 минут**, пока статус станет **Finished**.

Проверка:

- сайт: https://expo.dev → ваш проект → **Builds**  
- или: `npx --yes eas-cli build:list --platform ios --limit 3`

Там кнопка **Download** — это и есть **готовая iOS-сборка (`.ipa`)**.  
Именно её вы просили («чтобы была сборка готовая айос, а не веб»).

## A4. Загрузить IPA в App Store Connect

```bash
npx --yes eas-cli submit --platform ios --profile production --latest
```

Снова Apple ID, если спросит. После этого билд появится в App Store Connect → TestFlight (обработка ещё 10–30 мин).

---

# Путь B (основной без Expo) — Xcode Archive

Bundle ID: `com.trackit.lifeos`. Сначала выполните блок **«Обязательно после клона»** выше.

## B1. Signing

1. Слева таргет **TrackIt** → **Signing & Capabilities**  
2. **Team** → ваша **платная** Apple Developer команда  
3. Bundle Identifier = **`com.trackit.lifeos`**  
4. **Automatically manage signing** = ON  
5. Entitlements: `TrackIt/TrackIt.store.entitlements` (только Push).  
   Вход в приложение — **только email/пароль** (Google / Sign in with Apple убраны).

### Если видите `Supabase is not configured…`

Это **старая** сборка (до коммита с `.env.production` / code defaults).  
Сделайте `git pull` на `free-app` или `main` и **новый** Product → Archive. Старый IPA не чинится.
 

## B2. Archive (НЕ Run)

1. Сверху: схема **TrackIt**  
2. Устройство: **Any iOS Device (arm64)** — **не** симулятор, **не** ваш iPhone для Debug Run  
3. Меню: **Product → Archive**  
4. Organizer → **Distribute App → App Store Connect → Upload**

**Не нажимайте Product → Run** для публикации — отсюда ваши красные ошибки и «как будто веб».

---

# После загрузки IPA — App Store Connect (в браузере)

> **Название, категория, описание, keywords — не в Xcode и не в IPA.**  
> Их нет во вкладке General проекта. Заполняются только в App Store Connect  
> (или командой `npx eas-cli metadata:push` из готового `store.config.json` в корне репо).

**Полный чеклист выпуска (копипаст всех полей):**  
→ **`store/handoff/RELEASE_READY_RU.md`**

Кратко:

1. https://appstoreconnect.apple.com → **My Apps** → **+** → New App  
   - Name: **TrackIt**  
   - Bundle ID: **com.trackit.lifeos**  
   - Primary language: English (U.S.)  
   - SKU: `trackit-lifeos-001`  
   - Primary category: **Health & Fitness** · Secondary: **Productivity**

2. Метаданные + скриншоты + Privacy:  
   **`RELEASE_READY_RU.md`** · **`INSTRUCTIONS_RU.md`** · **`screenshots/`**  
   Машинный файл: корневой **`store.config.json`**

3. Privacy Policy: https://track-it-umber-psi.vercel.app/privacy  
   Support: https://track-it-umber-psi.vercel.app/support  

4. Дождаться билда в TestFlight → версия **1.0.0** → выбрать Build → **Submit for Review**.

---

## Краткий чеклист «что делать / чего не делать»

**Делать:**
- `eas build --profile production` → Download IPA  
- или Xcode **Archive** → Upload  
- заполнить App Store Connect по `store/handoff/`

**Не делать:**
- Xcode **Run** (Debug) и ждать «готовое приложение»  
- считать ошибку `No script URL` / `:8081` багом приложения — это режим разработки  
- просить IPA «без Apple Developer» — такого для стора не существует  
- `npx expo start` как способ сделать сборку для App Store  

---

## Если снова красный экран на телефоне

Вы снова в Debug. Либо:

1. Запускаете Metro: `npx expo start` на Mac, телефон и Mac в одной Wi‑Fi, в iOS **Settings → Privacy → Local Network** включить TrackIt,  
2. **Либо** (правильно для стора) бросаете Run и делаете **Путь A** или **Путь B** выше.

---

## Контакты владельца проекта

Support / вопросы по контенту листинга: mxrphin3work@gmail.com  
Env Supabase и демо-аккаунт для App Review — запросить у владельца отдельно.
