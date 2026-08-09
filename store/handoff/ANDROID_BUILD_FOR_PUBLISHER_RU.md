# Android AAB для посредника

**Дата:** 2026-08-09  
**Ветка кода:** `main` / `free-app` (`e325a5d`+)  
**Package:** `com.trackit.lifeos`  
**versionCode (EAS):** 11  

## Сборка (production AAB)

Статус и скачивание:
https://expo.dev/accounts/s4d1sms-team/projects/sadism/builds/c1a7e0f2-8a6d-433e-8163-65956609c25d

Когда статус **Finished** → кнопка **Download** → файл `.aab`.

Передать посреднику:
1. Этот `.aab`
2. Документ `store/handoff/FOR_PUBLISHER_ANDROID_RU.md`
3. Листинг `store/handoff/RELEASE_READY_RU.md`
4. Репо: https://github.com/mxrph1n3/TrackIt (ветка `main`)

## Что посредник делает в Play Console

1. Создать/открыть app `com.trackit.lifeos`
2. Загрузить AAB (Internal testing → потом Production)
3. Создать подписки:
   - `trackit_pro_monthly`
   - `trackit_pro_yearly`
4. Заполнить листинг (тексты EN/RU/ES/DE в `RELEASE_READY_RU.md`)
5. Data safety + отправка на ревью

## Демо для ревью

- Email: `review@trackit.app`
- Password: `trackit`

## Примечание по подписи

AAB подписан **EAS remote keystore** (Expo credentials `cB9niyg3oq`).  
Если посредник хочет свой upload key — нужна отдельная переподпись / новый keystore; обычно для первого релиза достаточно этого AAB + Play App Signing.
