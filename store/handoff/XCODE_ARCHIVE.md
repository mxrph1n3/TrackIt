# TrackIt — публикация через Xcode (Archive)

Проект уже подготовлен: bundle ID `com.trackit.lifeos`, имя **TrackIt**, email-вход, уведомления.
Нужен только **ваш** Apple Developer аккаунт ($99/год). Без него загрузить в App Store нельзя.

## Один раз: установка (обязательно)

В Git нет `node_modules` и `ios/Pods`. Без них: `No such module 'Expo'`, `*.modulemap not found`.

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
npm run setup:ios
```

Откроется **`TrackIt.xcworkspace`** — только его. Не `.xcodeproj`.  
Нужны Node 20+ и CocoaPods (`brew install cocoapods`).

## В Xcode — 4 действия

1. Слева таргет **TrackIt** → вкладка **Signing & Capabilities**
   - **Team** → выбрать вашу Apple Developer команду
   - Bundle Identifier должен быть **`com.trackit.lifeos`**
   - **Automatically manage signing** → включено  
   (Xcode сам создаст сертификат и профиль)

2. Сверху: схема **TrackIt**, устройство **Any iOS Device (arm64)**  
   (не симулятор и не Debug Run на телефон)

3. Меню **Product → Archive**  
   Дождаться окончания сборки.

4. В Organizer: **Distribute App → App Store Connect → Upload**

Готово — IPA уйдёт в App Store Connect. Дальше метаданные и Submit: см. `INSTRUCTIONS_RU.md`.

## Env (логин / Supabase)

Публичные ключи уже в репо (`.env.production` + code defaults). Отдельный `.env` для Archive не обязателен.  
Если логин пишет «Supabase is not configured» — обновите ветку и пересоберите Archive.

## Не делайте

- **Product → Run** в Debug для стора — это тянет Metro и даёт ошибки сети.
- Не меняйте Bundle ID вручную на другой.
- Не открывайте `.xcodeproj` вместо `.xcworkspace`.
