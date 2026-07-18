# TrackIt — инструкция для публикатора (iOS App Store)

**Кому:** тому, кто загружает приложение в App Store Connect  
**Репозиторий:** https://github.com/mxrph1n3/TrackIt  
**Ветка:** `main`  
**Bundle ID:** `com.trackit.lifeos`  
**Имя приложения:** TrackIt  

---

## Сначала прочитайте это (про ваши ошибки)

Сообщения вроде:

- `No script URL provided. Make sure the packager is running...`
- `Local network prohibited` / `Code=-1009` к `http://10.0.0.4:8081`
- `empty dSYM` / `UIScene lifecycle`

означают одно: вы запустили **Debug-сборку из Xcode (Product → Run)** на телефон.  
Такая сборка — **не готовое приложение**. Она пытается скачать JavaScript с компьютера (Metro packager), как «живой» режим разработки. Если Metro нет или iPhone блокирует локальную сеть — чёрный экран с красной ошибкой. Это **не веб**, но и **не release для App Store**.

Для App Store нужна **Release / Archive** или **EAS production build**.  
Внутри IPA уже лежит JS — Metro **не нужен**, телефон **не** ходит на `:8081`.

| Что вы делали | Что получается |
|---------------|----------------|
| Xcode → Run (Debug) | Нужен Metro → ваши ошибки |
| `npx expo start` + телефон | Тоже режим разработки |
| **EAS `production` build** или **Xcode Archive** | Готовый IPA для стора |

`empty dSYM` и `UIScene` можно игнорировать — это не причина красного экрана.

---

## Что нужно иметь

1. Mac с Xcode (для Archive) **или** только терминал + интернет (для EAS).  
2. **Платный Apple Developer** ($99/год) — без него IPA в стор не загрузить.  
3. Node.js 20+ (`node -v`).  
4. Доступ к GitHub-репозиторию TrackIt.  

Env для работы логина в приложении (попросите у владельца проекта, файл `.env` в git не лежит):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Их нужно добавить в EAS Environment Variables (production) на expo.dev **или** положить в `.env` в корне репо **перед** Archive / `xcodebuild`.  
Скрипт `ios/.xcode.env` подхватывает `.env` при сборке JS — без этого IPA покажет *«Supabase is not configured»*.

---

# Путь A (рекомендуется) — готовая сборка через EAS (облако)

Так вы получаете **настоящий IPA** без Metro и без Debug Run.

## A1. Клонировать и поставить зависимости

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
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

# Путь B — через Xcode Archive (тоже готовый IPA, без Metro)

В репозитории уже есть папка `ios/` с Bundle ID `com.trackit.lifeos`.

## B1. Подготовка

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
npm install
cd ios
pod install
cd ..
open ios/TrackIt.xcworkspace
```

Или: `npm run ios:xcode`

Открывать **только** `TrackIt.xcworkspace`, не `.xcodeproj`.

## B2. Signing

1. Слева таргет **TrackIt** → **Signing & Capabilities**  
2. **Team** → ваша Apple Developer команда  
3. Bundle Identifier = **`com.trackit.lifeos`**  
4. **Automatically manage signing** = ON  

## B3. Archive (НЕ Run)

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
