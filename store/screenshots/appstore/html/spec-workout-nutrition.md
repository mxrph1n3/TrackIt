Both screens live in one screen file — `src/screens/HealthHubScreen.tsx` — as two tabs ("Workouts" / "Nutrition"). **Critical theme note:** the Health module does NOT use the global Ethereal glass tokens you quoted. It has its own token set in `src/components/health/ui/healthTheme.ts` (light mode = `HEALTH_THEME`):

```2:26:src/components/health/ui/healthTheme.ts
export const HEALTH_THEME = {
  background: '#F7F8FC',
  canvas: '#F7F8FC',
  card: '#FFFFFF',
  cardBorder: 'rgba(119, 93, 216, 0.08)',
  accent: '#7C5CFC',
  accentSoft: 'rgba(124, 92, 252, 0.12)',
  accentMuted: 'rgba(124, 92, 252, 0.35)',
  ink: '#1E1A3E',
  slate: '#7F7D9C',
  muted: '#8E89B3',
  shadow: 'rgba(119, 93, 216, 0.08)',
  radius: {
    card: 30,
    control: 16,
    pill: 999,
  },
  macro: {
    protein: '#7C5CFC',
    fat: '#F59E0B',
    carbs: '#34D399',
    water: '#60A5FA',
  },
} as const;
```

So: canvas `#F7F8FC` (not #F3F5FA), cards are **solid white** `#FFFFFF` with 1px border `rgba(119,93,216,0.08)` and **radius 30** (not 28/glass). Card shadow (`HEALTH_ELEVATION.card`): `shadowColor '#775DD8', offset {0,8}, opacity 0.06, radius 24`. Button shadow: `shadowColor '#7C5CFC', offset {0,6}, opacity 0.22, radius 14`. Every card sits in a `PremiumCard` wrapper: default `padding: 20`, `marginBottom: 16`, `overflow: 'hidden'`.

---

# Shared header (both tabs) — `HealthTabSwitcher`

Order top-to-bottom, screen padding: `paddingTop: insets.top + 12`, horizontal padding from `getScreenHorizontalPadding()` (screenLayout token, typically 20).

1. **Title row** (`flexDirection: row`, `justifyContent: space-between`, `marginBottom: 16`):
   - Left: menu button — lucide `Menu` icon, 22px, `strokeWidth 1.5`, color ink, inside a 40×40 pressable.
   - Center (flex 1): screen title — `"Workouts"` or `"Nutrition"`, `fontSize 32, fontWeight '900', letterSpacing -0.8`, color `#1E1A3E`, `marginBottom 4`. Subtitle below — `"Today's training"` (workouts) or `"Today's summary"` (nutrition), `fontSize 15, fontWeight '500'`, color `#7F7D9C`.
   - Right (nutrition tab only): calendar button — 40×40 circle (`borderRadius 20`), white bg, 1px cardBorder, lucide `CalendarDays` 20px `strokeWidth 2` in ink. On workouts tab, an empty 40×40 spacer.
2. **Tab segmented control**: white pill container `borderRadius 16, padding 4`, 1px cardBorder. Two equal tabs (`flex: 1, paddingVertical 10, borderRadius 12`), labels `"Workouts"` / `"Nutrition"`, `fontSize 13, fontWeight '700'`. Inactive text `#7F7D9C`; active tab gets bg `rgba(124,92,252,0.12)` and text `#1E1A3E`.

---

# SCREEN 1 — Workouts tab (`WorkoutsTabPanel`)

Render order: `TrainingHeroCard → WeeklyProgressCard → TrainingStatsGrid → StreakCard → RecentWorkoutCard → NextWorkoutCard → TrainingWeekList`.

### 1. TrainingHeroCard (today's workout hero)
`PremiumCard` with `padding 0`, `overflow hidden`. Contents: an `ImageBackground` (asset `workout_hero_bg.png`, scaled 1.15 and shifted +16px right, top corners radius 30) with `minHeight 220`, overlaid by a **horizontal** LinearGradient scrim (ethereal `vertical` preset): colors `['rgba(247,248,252,0.96)', 'rgba(247,248,252,0.78)', 'rgba(247,248,252,0.12)', ...]` at locations `[0, 0.28, 0.52, 0.72]`, running left→right (`start {0,0.5}, end {1,0.5}`) — i.e. text sits on a frosted left side, image shows through on the right. Gradient inner padding: `20`, `paddingRight 108`, content vertically centered.

Text stack (top→bottom):
- Kicker: `"Today's Workout"` — `fontSize 11, fontWeight '700', letterSpacing 2, uppercase`, color slate `#7F7D9C`.
- Title: focus name, e.g. `"Day 1 — Upper"` (from mass-gain program) — `fontSize 28, fontWeight '900', letterSpacing -0.8`, ink, `marginTop 6`.
- Muscle line via `formatMuscleGroups()` — e.g. `"Chest · Back · Arms"` for "Upper", `"Quads · Glutes · Hamstrings"` for legs — `fontSize 13, fontWeight '500', lineHeight 18`, slate, `marginTop 6`.
- Meta: `` `${exerciseCount} exercises · ~${estimatedMinutes} min` `` e.g. `"6 exercises · ~55 min"` — `fontSize 14, fontWeight '600'`, muted `#8E89B3`, `marginTop 10`.
- CTA (`marginTop 16`): **"Start Workout"** button (`HealthPrimaryButton` solid) — bg `#7C5CFC`, `borderRadius 16, paddingVertical 16, paddingHorizontal 20`, centered row with lucide `Play` icon (18px, filled, ink color) + label `fontSize 16, fontWeight '700', letterSpacing 0.2` in ink `#1E1A3E`, purple glow shadow.

Optional note strip pinned under the image if the program day has notes: `borderTopWidth 1` (cardBorder), white bg, `padding 20/12`, text `fontSize 12, lineHeight 17` slate.

### 2. WeeklyProgressCard
`PremiumCard padding 16`. Single header row (`marginBottom 12, gap 8`): kicker `"Week Progress"` (11/700/ls2/uppercase, slate, flex 1) · middle text `"{completed} / {target} workouts"` e.g. `"3 / 5 workouts"` (13/700 ink) · right `"{percent}%"` e.g. `"60%"` (13/700, accent `#7C5CFC`, minWidth 36, right-aligned). Below: `HealthProgressBar` height 6 — track `rgba(124,92,252,0.12)` rounded (radius = height/2 = 3), fill `#7C5CFC`.

### 3. TrainingStatsGrid (lifetime stats)
`PremiumCard padding 14` containing a row of 4 equal tiles (`gap 8`). Each tile: `flex 1, borderRadius 16`, bg `rgba(124,92,252,0.12)` (accentSoft), `paddingVertical 12, paddingHorizontal 6`, centered column:
- Icon on top (`marginBottom 6`), 16px, color `#7C5CFC`: lucide `Dumbbell`, `Hourglass`, `TrendingUp`, `Medal` respectively.
- Value: `fontSize 18, fontWeight '900', letterSpacing -0.4`, ink. Values: total workouts (e.g. `"48"`), hours (`totalMinutes/60`, e.g. `"36"`), volume `` `${(tonnageKg/1000).toFixed(0)}t` `` e.g. `"52t"`, PR count e.g. `"12"`.
- Label: `fontSize 9, fontWeight '700', uppercase, letterSpacing 0.8`, slate, `marginTop 2`. Labels: `"Workouts"`, `"Hours"`, `"Volume"`, `"PRs"`.

### 4. StreakCard
Fixed height **168**, `borderRadius 30`, 1px border, white bg, `overflow hidden`, card shadow, `marginBottom 16`. Background image `today_widget_bg.png` (full bleed) under a vertical `horizontalSoft` scrim: `['rgba(247,248,252,0.94)', 'rgba(247,248,252,0.82)', 'rgba(247,248,252,0.55)']` locations `[0, 0.45, 1]`. Inner padding `20/18`, content `justifyContent: space-between`:
- Top: kicker row (gap 6): lucide `Flame` 14px filled accent + `"Streak"` (11/700/ls2/uppercase slate). Value: `"{n} days"` e.g. `"14 days"` — `fontSize 28, fontWeight '900', letterSpacing -0.6`, ink, `marginTop 6`. Under it: `"Longest: {n} days"` — 13/500 muted, `marginTop 4`.
- Bottom (`marginTop 18`): 7 day columns spread across (`justifyContent: space-between`), each: 28×28 circle (`borderRadius 14`) — done days solid `#7C5CFC` with lucide `Check` 12px strokeWidth 3 in ink; open days bg accentSoft + 1px border `rgba(124,92,252,0.35)`. Below circle (gap 6): day label `"Mon" "Tue" "Wed" "Thu" "Fri" "Sat" "Sun"` — `fontSize 10, fontWeight '600'`, slate.

### 5. RecentWorkoutCard (last session — hidden if no session)
`PremiumCard` (padding 20). Top row (gap 14): 56×56 thumb (`borderRadius 16`, the workout hero image, scaled 1.15) · copy column (flex 1): title = last session focus name e.g. `"Day 1 — Upper"` (17/800 ink), meta `` `${relativeDay} · ${durationMinutes} min` `` e.g. `"Today · 62 min"` (13/500 muted, marginTop 4) · right XP pill: bg accentSoft, `paddingHorizontal 10, paddingVertical 6, borderRadius 999`, lucide `Sparkles` 14px accent + `"+{xp} XP"` e.g. `"+240 XP"` (12/800 accent).
Bottom stats row: `marginTop 16, paddingTop 14, borderTopWidth 1` (cardBorder), 3 equal centered blocks: value 16/800 ink, label 10/600 uppercase ls0.8 slate (marginTop 2). Labels `"Exercises"`, `"Sets"`, `"Volume"` — volume formatted `"6.2t"` if ≥1000 kg else `"850 kg"`.

### 6. NextWorkoutCard
`PremiumCard` at **opacity 0.72** (deliberately faded). Row (gap 12): copy (flex 1) — kicker `"Next Workout"` (11/700/ls2/uppercase slate), title = the day's split e.g. `"Day 2 — Legs + Shoulders"` (18/800 ink, marginTop 4), meta `` `${whenLabel} · ~${min} min` `` e.g. `"Tomorrow · ~60 min"` (13/500 muted). Right: 44×44 square `borderRadius 14` bg accentSoft with lucide `CalendarDays` 22px `strokeWidth 1.8` slate.

### 7. TrainingWeekList ("This Week")
Section title `"This Week"` — 11/700/ls2/uppercase slate, `marginBottom 12, paddingHorizontal 4`. Then 7 `PremiumCard`s (padding 16, marginBottom 16 each). Rest days at opacity 0.65; today's card gets border color `rgba(124,92,252,0.35)`. Each row (`space-between`):
- Left column: day label `"MON"`… (12/700 uppercase ls1.2 slate), split name e.g. `"Day 1 — Upper"` (16/700 ink, marginTop 4; muted color if rest), meta `` `~${min} min · +${xp} XP` `` e.g. `"~55 min · +192 XP"` (12/500 muted) or `"Recovery"` for rest days (12/500 slate).
- Right: if completed — 32×32 green circle `#34D399` with white/ink `Check` 16px strokeWidth 3; if today — pill `"Today"` (bg accentSoft, `paddingHorizontal 10, paddingVertical 4, borderRadius 999`, text 11/700 accent); if upcoming training day — lucide `Sparkles` 16px muted.

Note on "weight tracking": the store holds `bodyStats: { weightKg: 78.2, progressPercent: 3 }` but no weight card renders on this tab — weight/body stats surface on other screens (e.g. `WorkoutDetailsScreen`).

---

# SCREEN 2 — Nutrition tab (`NutritionTabPanel`)

Extra elements before the panel (nutrition tab only):
- **HealthDateRibbon**: horizontal row of 7 day chips (gap 10, marginBottom 20). Chip: 52×68, `borderRadius 18`, white bg, 1px cardBorder, centered column — weekday `"Mon"…"Sun"` (11/600 slate, marginBottom 4) over day number (17/800 ink). Active/today chip: solid `#7C5CFC` bg and border, both texts turn ink.
- **Hint strip**: `borderRadius 14`, 1px border `rgba(119,93,216,0.1)`, white bg, `padding 14/10`, text 12/600 lineHeight 18 slate: `"Nutrition and water logs reflect today."` (or amber-tinted warning variant `"Day picker applies to workouts only — nutrition and water always show today."` — border `rgba(245,158,11,0.28)`, bg `rgba(245,158,11,0.08)`).

Panel order: `CaloriesHeroCard → MacroCardsRow → WaterTrackerCard → MealsTimeline → NextMealCard → NutritionScoreCard → "Add Meal" button`.

### 1. CaloriesHeroCard
`PremiumCard` (padding 20, pressable → DailyProgress). Kicker `"Today's Summary"` (11/700/ls2/uppercase slate, marginBottom 14). Row, space-between:
- Left copy: baseline row — consumed calories e.g. `"1,450"` (`fontSize 36, fontWeight '900', letterSpacing -1.2` ink) + `" / 2,200 kcal"` (18/600 slate). Below: `"{remaining} kcal left"` e.g. `"750 kcal left"` (14/500 muted, marginTop 8). Numbers use `toLocaleString('en-US')` (comma thousands).
- Right: SVG progress ring — size 120, strokeWidth 10, round linecap, starts at 12 o'clock (rotation −90). Track circle `rgba(124, 92, 252, 0.12)`; progress stroke is a diagonal SVG gradient `#9580E8 → #7C5CFC`. Centered label: `"{percent}%"` (18/800 ink) over `"of goal"` (10/600 slate, marginTop 2).

### 2. MacroCardsRow
Row of 3 separate `PremiumCard`s (gap 10, each padding 16, flex 1). Each `MacroTile`:
- Label `"Protein"` / `"Fat"` / `"Carbs"` — `fontSize 10, fontWeight '700', letterSpacing 1.5, uppercase`, slate, marginBottom 6.
- Value: current grams (20/900 ink) with inline suffix `" /165g"` style (13/600 slate). E.g. `"120 /165g"`.
- Progress bar: height 5, `borderRadius 3`, track accentSoft; fill colors: protein `#7C5CFC`, fat `#F59E0B`, carbs `#34D399`.

### 3. WaterTrackerCard
`PremiumCard padding 20`. Light-mode water palette: badge bg `rgba(56,189,248,0.12)`, badge border `rgba(56,189,248,0.2)`, track `rgba(56,189,248,0.1)`, button gradient `['#BAE6FD', '#38BDF8', '#0284C7']`, progress gradient `['#BAE6FD', '#60A5FA', '#38BDF8']`.
- Header row (gap 12, marginBottom 18): 42×42 badge (`borderRadius 14`, blue-tinted bg + border) with lucide `Droplets` 20px `strokeWidth 2.2` in `#60A5FA`. Copy: kicker `"Hydration"` (11/700/ls2/uppercase slate) + subtitle `"{filled} of {total} glasses today"` e.g. `"5 of 12 glasses today"` (13/600 muted, marginTop 3). A glass = 250 ml.
- Metrics row (baseline, space-between, marginBottom 8): left — `"1.3"` (`fontSize 34, fontWeight '900', letterSpacing -1.1` ink) + `" L"` (18/700 slate) + `" / 3.0 L"` (16/600 slate). Right — percent badge: `minWidth 58, padding 12/10, borderRadius 16`, blue badge bg/border, `"{percent}%"` (18/900, color `#0369A1` in light mode) over `"goal"` (10/700 uppercase ls0.6 slate).
- Remaining line: `"1,750 ml left to hydrate"` or `"Daily goal reached"` — 13/500 muted, marginBottom 14.
- Progress bar: height 10, `borderRadius 999`, track `rgba(56,189,248,0.1)`, fill = horizontal 3-stop blue gradient.
- Add button (marginTop 16): full-width gradient pill `borderRadius 20`, diagonal gradient `#BAE6FD → #38BDF8 → #0284C7`, 1px border `rgba(255,255,255,0.28)`, `padding 18/14`, top glossy overlay gradient (white 0.42→0). Centered row (gap 12): 36×36 white-frosted circle (`bg rgba(255,255,255,0.22)`, border `rgba(255,255,255,0.38)`) with white `Plus` 17px strokeWidth 3; then `"+250"` (22/900 white, ls −0.6, tabular-nums) + `"ml"` (14/700 uppercase, `rgba(255,255,255,0.88)`). Blue glow shadow: offset {0,8}, opacity 0.34, radius 18.

### 4. MealsTimeline
Section header row (space-between, marginBottom 12, paddingHorizontal 4): `"Meals"` (11/700/ls2/uppercase slate) and `"{n} / 5 completed"` (12/600 muted). Then 5 `PremiumCard`s (padding 16) in slot order **breakfast, lunch, snack, dinner, evening_snack**. Row (gap 12):
- Status square: 32×32, `borderRadius 10`, bg accentSoft; when logged, solid `#7C5CFC` with `Check` 14px strokeWidth 3 (ink); when pending, lucide `Clock` 14px slate.
- Copy (flex 1): slot label — `"Breakfast"`, `"Lunch"`, `"Snacks"`, `"Dinner"`, `"Evening Snack"` (11/700 uppercase ls1.2 slate); meal name or `"Pending"` (16/700 ink, marginTop 2, 1 line); third line — logged: `"{kcal} kcal"` (13/700 **accent purple**) / pending: scheduled time `"08:00" / "13:00" / "16:30" / "19:00" / "21:00"` (13/600 muted).
- Right: lucide `ChevronRight` 18px muted.

### 5. NextMealCard (hidden if all 5 slots logged)
`PremiumCard` (padding 20, pressable → FoodSearch). Stack: kicker `"Next Meal"` (11/700/ls2/uppercase slate) → slot label e.g. `"Dinner"` (22/800 ink, marginTop 6) → time `"19:00"` (15/600 muted, marginTop 4) → live countdown e.g. `"02:41:07"` (`fontSize 28, fontWeight '900', letterSpacing 1, tabular-nums`, **accent `#7C5CFC`**, marginTop 10, ticks every second, format HH:MM:SS).

### 6. NutritionScoreCard
`PremiumCard`, row (gap 16):
- Left copy (flex 1): kicker `"Nutrition Score"` (11/700/ls2/uppercase slate, marginBottom 8); headline `"Good job! Keep going!"` (score ≥ 75) or `"Room to improve today"` (17/800 ink, marginBottom 8); up to 3 bullet tips prefixed `"· "` (13/500 muted, lineHeight 20) — strings: `"Protein goal on track"`, `"Calories within target range"`, `"{n} meals logged today"`, `"Log meals to improve your score"`.
- Right: SVG ring — size 88, strokeWidth 8, track accentSoft, progress solid `#7C5CFC`, round cap, −90° start. Center: score number (22/900 ink) over `"/ 100"` (11/600 slate).

### 7. Bottom CTA
`HealthPrimaryButton` **"Add Meal"** — same solid style as "Start Workout": bg `#7C5CFC`, radius 16, `paddingVertical 16`, label 16/700 ink, purple glow shadow, no icon.

---

### Handy realistic data for mockups
- Program: track title `"Lean Mass Gain"`; day names `"Day 1 — Upper"`, `"Day 2 — Legs + Shoulders"`, `"Day 3 — Upper"`, `"Day 4 — Lower + Shoulders"`, `"Day 7 — Rest"` etc.
- XP per training day = `120 + exercises × 12` (6 exercises → `+192 XP`).
- Default body weight in store: `78.2 kg`; calorie/macro targets are computed (Mifflin BMR), typical fat-loss defaults land around ~2,000–2,200 kcal.
- All uppercase kickers share one style recipe: `fontSize 11, fontWeight '700', letterSpacing 2, textTransform 'uppercase', color #7F7D9C`.