# TrackIt — инструкция для публикатора (Android / Google Play)

**Кому:** тому, кто загружает приложение в Google Play Console  
**Репозиторий:** https://github.com/mxrph1n3/TrackIt  
**Ветка:** `main` или `free-app`  
**Package name:** `com.trackit.lifeos`  
**Имя:** TrackIt  

Сводка по обеим платформам: [`../../START_HERE_PUBLISHER_RU.md`](../../START_HERE_PUBLISHER_RU.md)  
Листинг / тексты: [`RELEASE_READY_RU.md`](./RELEASE_READY_RU.md)  
Техническая схема биллинга: [`../../docs/GOOGLE_PLAY_PAID.md`](../../docs/GOOGLE_PLAY_PAID.md) · [`../../docs/NATIVE_PAID.md`](../../docs/NATIVE_PAID.md)

---

## Модель монетизации

| | |
|--|--|
| Подписка | TrackIt Pro |
| Product IDs (Play) | `trackit_pro_monthly`, `trackit_pro_yearly` (**без** `_v2`) |
| Цена (ориентир) | **$5.99 / месяц**, ~$50 / год |
| Soft-trial в приложении | **3 дня** полного Pro (локально на устройстве) |
| После триала | Paywall / Pro-фичи закрываются |
| Биллинг | Google Play Billing (`expo-iap`) — **без RevenueCat** |
| Языки UI | EN / RU / ES / DE |
| Регион | **Исключить Russia** в Countries |

Деньги с покупок идут на **аккаунт разработчика Google Play** публикатора.

---

## Что нужно иметь

1. Аккаунт **Google Play Console** (разовый сбор разработчика).  
2. Доступ к GitHub TrackIt **или** готовый `.aab` от владельца.  
3. Node.js 20+ (если собираете сами).  
4. Ключ подписи / EAS credentials (если EAS; либо upload key в Play).

---

## Путь A — готовый AAB от владельца

1. Получите файл `.aab` (production), versionCode **≥ 31**.  
2. Play Console → приложение `com.trackit.lifeos` → **Production** или **Internal testing** → Create release → загрузить AAB.  
3. Создайте подписки (раздел ниже) **до** или сразу после первого релиза.  
4. **Countries → exclude Russia.**  
5. Заполните листинг по `RELEASE_READY_RU.md`.  
6. Отправьте на ревью.

---

## Путь B — сборка через EAS

```bash
git clone https://github.com/mxrph1n3/TrackIt.git
cd TrackIt
git checkout free-app
git pull
npm install
npx --yes eas-cli login
npx --yes eas-cli build --platform android --profile production
```

Дождаться **Finished** → Download `.aab` → загрузить в Play Console.

Опционально submit:

```bash
npx --yes eas-cli submit --platform android --profile production --latest
```

### Env на Expo (production)

Владелец обычно уже выставил (или они вшиты через `.env.production` / defaults):

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

RevenueCat **не используется**.

---

## Google Play Console — подписки (обязательно)

1. **Monetize → Products → Subscriptions**  
2. Создать:
   - `trackit_pro_monthly` — auto-renewing, ~$5.99/месяц  
   - `trackit_pro_yearly` — auto-renewing, ~$49.99–50/год  
3. Активировать base plan + offers.  
4. **Не** создавать `_v2` id на Play — приложение их не покупает.

Без активных подписок кнопка Subscribe в приложении не сможет провести оплату.

---

## Листинг (Store presence)

| Поле | Значение |
|------|----------|
| App name | TrackIt |
| Package | com.trackit.lifeos |
| Category | Health & Fitness (или Productivity) |
| Free / Paid | **Free** (с in-app subscriptions) |
| Privacy policy | https://track-it-umber-psi.vercel.app/privacy |

Тексты EN/RU/ES/DE — в `RELEASE_READY_RU.md` и `store.config.json`.

**Графика:**
- Icon: `store/handoff/app-icon-1024.png` (адаптив уже в билде)
- Feature graphic: `store/feature-graphic.png` (если есть)
- Phone screenshots: `store/handoff/screenshots/6.9-inch/` (01…06)

---

## Data safety / Privacy

Кратко (уточнить по факту у владельца):

- Собирается: email аккаунта, контент пользователя (задачи, тренировки, питание, финансы), user ID  
- Не для рекламы третьих лиц  
- Account deletion: в приложении Settings → Delete account  

---

## Тест перед продом

1. Internal testing track + лицензионный тестер Google.  
2. Установить → войти (`review@trackit.app` / `trackit` или свой).  
3. Profile → Subscribe / открыть Pro-фичу → paywall.  
4. Купить тестовой картой / license tester.  
5. Restore purchases на Premium-экране.

---

## Review / ответы модерации

Демо: `review@trackit.app` / `trackit`  

Notes (EN):

```
TrackIt offers a 3-day soft trial with full Pro access on first launch.
After the trial, Pro features require an auto-renewable subscription
(trackit_pro_monthly / trackit_pro_yearly) via Google Play Billing.

Sign-in: email and password only.
Account deletion: Settings → Account → Delete account.
Notifications: opt-in in Settings (disabled by default).

Privacy: https://track-it-umber-psi.vercel.app/privacy
Terms: https://track-it-umber-psi.vercel.app/terms
```

---

## Частые ошибки

| Проблема | Решение |
|----------|---------|
| «Item not available» при покупке | Подписки не активны / неверный ID (`trackit_pro_monthly` без `_v2`) / base plan не Active |
| Billing Library | Нужен AAB с `expo-iap` (ветка `free-app`, versionCode ≥ 31) |
| Нет Pro после оплаты | Restore purchases; проверить `sync-subscription-status` / profiles.is_pro |
| Старый free-билд | `git checkout free-app && git pull` и новый production AAB |

Контакт владельца: mxrphin3work@gmail.com
