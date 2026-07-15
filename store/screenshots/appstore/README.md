# App Store screenshots (iOS)

Ready-to-upload marketing screenshots for App Store Connect. All copy is in English.

## Files

| File | Screen | Headline |
|---|---|---|
| `01-dashboard.png` | Dashboard | Your Entire Life. One Command Center. |
| `02-planner.png` | Planner | Plan Your Day in Seconds. |
| `03-workouts.png` | Workouts | Workouts That Build Momentum. |
| `04-nutrition.png` | Nutrition | Calories, Macros & Water — Logged. |
| `05-finance.png` | Finance | Know Where Your Money Goes. |
| `06-analytics.png` | Analytics | Watch Yourself Level Up. |

## Sizes

- Root folder: **1320 × 2868** — iPhone 6.9" (16 Pro Max / 15 Pro Max slot)
- `6.5-inch/`: **1284 × 2778** — iPhone 6.5" (older size slot, only if App Store Connect asks for it)

Upload order in App Store Connect = file order (01 → 06).

## How they were made

Each screen is a pixel-faithful HTML recreation of the real app UI (same design
tokens, copy and components as `src/`), framed in an iPhone mockup with a
marketing headline. Sources live in `html/`.

Regenerate after edits:

```bash
bash store/screenshots/appstore/html/render.sh
```

(Renders every `html/0*.html` page to a 1320×2868 PNG via headless Chromium.)
