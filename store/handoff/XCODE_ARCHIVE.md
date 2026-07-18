# TrackIt — публикация через Xcode (Archive)

Проект уже подготовлен: bundle ID `com.trackit.lifeos`, имя **TrackIt**, email-вход, уведомления.
Нужен только **ваш** Apple Developer аккаунт ($99/год). Без него загрузить в App Store нельзя.

## Один раз: установка

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout main
npm install
cd ios && pod install && cd ..
open ios/TrackIt.xcworkspace
```

Или одной командой из корня:

```bash
npm run ios:xcode
```

Открывать именно **`TrackIt.xcworkspace`**, не `.xcodeproj`.

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
