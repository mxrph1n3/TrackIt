# TrackIt — пакет для публикации в App Store

Всё для App Store Connect и ревью.

**Сводка обеих платформ:** [`../../START_HERE_PUBLISHER_RU.md`](../../START_HERE_PUBLISHER_RU.md)  
**Чеклист + тексты EN/RU/ES/DE + IAP:** [`RELEASE_READY_RU.md`](./RELEASE_READY_RU.md)  
**Android:** [`FOR_PUBLISHER_ANDROID_RU.md`](./FOR_PUBLISHER_ANDROID_RU.md)  
**EAS Metadata:** [`../../store.config.json`](../../store.config.json)

> Категория / subtitle / description **не в Xcode** — только в App Store Connect.

## Модель

Free download + подписка **TrackIt Pro** (`trackit_pro_monthly_v2` / `trackit_pro_yearly_v2`). Soft-триал **3 дня**. Языки UI: EN / RU / ES / DE.

## Сборка IPA

### Рекомендуется: Xcode Archive

```bash
git clone https://github.com/mxrph1n3/TrackIt.git && cd TrackIt
git checkout main && git pull
npm run setup:ios
```

Пошагово: **[`XCODE_ARCHIVE.md`](./XCODE_ARCHIVE.md)** · **[`FOR_PUBLISHER_RU.md`](./FOR_PUBLISHER_RU.md)**

В Xcode: Team → **Product → Archive** → **Distribute App → App Store Connect**.

### Альтернатива: EAS

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --profile production --latest
```

---

## 1. Создать приложение

| Поле | Значение |
|------|----------|
| Platform | iOS |
| Name | **TrackIt** |
| Primary language | English (U.S.) |
| Bundle ID | **com.trackit.lifeos** |
| SKU | trackit-lifeos-001 |

Добавьте локали Russian / Spanish / German — тексты в `RELEASE_READY_RU.md`.

---

## 2. Подписки (обязательно)

| Product ID | Тип | Цена-ориентир |
|------------|-----|----------------|
| `trackit_pro_monthly_v2` | Auto-renewable | ~$5.99 / month |
| `trackit_pro_yearly_v2` | Auto-renewable | ~$50 / year |

Группа: TrackIt Pro. RevenueCat entitlement: **`pro`**.

---

## 3. Метаданные

| Поле | Значение |
|------|----------|
| Subtitle | Tasks, health & habits OS |
| Primary category | Health & Fitness |
| Secondary category | Productivity |
| Price (download) | Free (0 USD) |
| In-App Purchases | **создать** две подписки выше |
| Privacy Policy URL | https://track-it-umber-psi.vercel.app/privacy |
| Support URL | https://track-it-umber-psi.vercel.app/support |

Полные description / promo / keywords / RU/ES/DE → **`RELEASE_READY_RU.md`**.

---

## 4. Скриншоты

- `screenshots/6.9-inch/` — обязательный набор, 01→06  
- `screenshots/6.5-inch/` — опционально  
- iPad не нужен (`supportsTablet: false`)

---

## 5. App Privacy

- **Data used to track you:** No  
- **Linked to you:** Email, Fitness, Other User Content, User ID — App Functionality  
- Third-party advertising: No  

---

## 6. Age Rating

Все «None/No» → **4+**.

---

## 7. App Review Information

- Sign-in required: Yes  
  - Username: `review@trackit.app`  
  - Password: `trackit`
- Notes: см. блок Review notes в `RELEASE_READY_RU.md` (trial + subscription, не «fully free»).

---

## 8. Отправка

1. Билд в TestFlight.  
2. Version → Build.  
3. Export Compliance: already `ITSAppUsesNonExemptEncryption = false`.  
4. Подписки в состоянии Ready to Submit вместе с приложением.  
5. **Submit for Review.**

Вопросы: mxrphin3work@gmail.com
