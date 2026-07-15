# TrackIt — Pixel-faithful visual spec for Dashboard & Planner screens

All values quoted directly from source. Both screens sit on a shared animated background and share the floating tab bar + crystal FAB (described at the end).

---

## SHARED FOUNDATION

### Screen background (`src/components/ui/AmbientBackground.tsx`)
Rendered behind everything (screens themselves are `backgroundColor: 'transparent'`):
- Base fill `#F3F5FA`, with a vertical `LinearGradient` `[#E2D9FF (lavenderMist), #F3F5FA, #FFFFFF]` at locations `[0, 0.45, 1]`.
- Three huge blurred radial "neon blobs" drifting slowly:
  - `#E2D9FF` blob, size 105% of screen width, positioned top-left (left −32% W, top −14% H)
  - `#775DD8` blob, size 86% W, at left 38% W / top 48% H
  - `#C9BBFF` blob, size 94% W, at left 4% W / top 22% H
  - Each is a radial gradient: stop 0% opacity 0.3 → 35% at 0.12 → 70% at 0.04 → 100% at 0.
- A vignette overlay gradient `['rgba(255,255,255,0.12)', 'rgba(243,245,250,0.35)', 'rgba(255,255,255,0.88)']` at locations `[0, 0.55, 1]` (so the bottom of the screen washes toward white).

### Light (Ethereal) theme values (`src/theme/themes.ts`)
- `textPrimary: '#1E1A3E'`, `textSecondary: '#7F7D9C'`, `textMuted: '#8E89B3'`
- `card: rgba(255,255,255,0.75)`, `cardFrosted: 'rgba(255, 255, 255, 0.72)'`
- `border: rgba(255,255,255,0.60)`, `borderSubtle: 'rgba(119, 93, 216, 0.14)'`
- `primary/primaryNeon: '#775DD8'`, `cardRadius: 28`, `ringTrack: 'rgba(119, 93, 216, 0.12)'`
- Shadow: color `#775DD8`, opacity `0.05`, radius `20`; glass shadow helper uses `{offset 0/4, opacity 0.08, radius 10}`.

### Themed surfaces used inside cards (`src/theme/themedSurfaces.ts`, light values)
```6:13:src/theme/themedSurfaces.ts
    chip: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.52)',
    chipStrong: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.72)',
    inset: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.82)',
    empty: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.35)',
    progressTrack: isDark ? 'rgba(119, 93, 216, 0.22)' : 'rgba(255, 255, 255, 0.55)',
    divider: isDark ? 'rgba(119, 93, 216, 0.18)' : 'rgba(119, 93, 216, 0.08)',
    openButton: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.55)',
    dashedBorder: isDark ? 'rgba(119, 93, 216, 0.28)' : 'rgba(119, 93, 216, 0.18)',
```
`onPrimary` (text/icon on purple) in light mode is `#1E1A3E`.

### Layout
- Screen gutter: `paddingHorizontal: 20` (iOS; 12 Android). Scroll `paddingTop: insets.top + 8`.
- Card gap: each card has `marginBottom: 14`.
- Glass card recipe (`GlassPanel` / `PlannerPremiumCard`): radius 28 (Dashboard's `OverallProgressCard`/`TodaysScheduleCard` pass `borderRadius={26}`), `borderWidth: 1`, borderColor `rgba(255,255,255,0.60)` (GlassPanel) or `borderSubtle rgba(119,93,216,0.14)` (PlannerPremiumCard), fill `rgba(255,255,255,0.75)`/`0.72` over BlurView (iOS only; on web use the solid rgba fill).

### Checkbox (shared, `ScheduleCheckbox`)
24×24, `borderRadius: 7`. Unchecked: fill `rgba(255,255,255,0.5)`, border `1.5px rgba(139, 92, 246, 0.45)`. Checked: diagonal gradient `['#775DD8', '#775DD8', '#6366F1']` (Obsidian primary/primaryNeon are both `#775DD8`), glow shadow `shadowOpacity 0.65, radius 10`, white-ish check (`onPrimary #1E1A3E` in light — a dark ink check on the purple gradient), lucide `Check` size 14, strokeWidth 3. Indeterminate: gradient `['#94A3B8', '#CBD5E1', '#94A3B8']` with a 10×2 dash.

---

## SCREEN 1 — DASHBOARD (`src/screens/DashboardScreen.tsx`)

Order top→bottom: Header → Overall Progress → Today's Schedule → Focus Streak → Health card → Finance card.

### 1. Header (`DashboardHeader.tsx`)
Single row, `marginBottom: 22`, `justify-between`:
- Left: menu button — 40×40 touch area, lucide `Menu` icon, color `#1E1A3E`, size 22, strokeWidth 1.5. No background.
- Center: title text `Dashboard` — `text-[11px] font-bold uppercase tracking-[0.35em]` color `#1E1A3E` (matches `TYPOGRAPHY.screenTitle`: 11px / 700 / letterSpacing 3.5 / uppercase).
- Right: settings button — 40×40, lucide `SlidersHorizontal`, color `#1E1A3E`, size 20, strokeWidth 1.5.

No greeting, no avatar, no XP bar, no date on this header.

### 2. Overall Progress card (`OverallProgressCard.tsx`)
GlassPanel radius 26. Inner padding: `paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 14`.

**Header row** (space-between):
- Title `Overall Progress` — 10px / 700 / letterSpacing 2.4 / uppercase / color `#8E89B3` (textMuted).
- Tier capsule (level badge), pill `borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1`. Label 9px / 900 / letterSpacing 0.16 / uppercase. Tiers (`tierTheme.ts`): levels 1–10 "TIER D" (text `#775DD8`, bg `rgba(119,93,216,0.12)`, border `rgba(119,93,216,0.35)`), 11–25 "TIER C" (`#6366F1`), 26–45 "TIER B" (`#60A5FA`), 46–70 "TIER A" (`#E879F9`), 71–95 "TIER S" (`#775DD8`), 96+ "TIER SS" (gold gradient `['#FFD700','#F59E0B','#FFD700']`, text `#FFF7CC`). Capsule glow: `shadowColor: tier.primary, opacity 0.55, radius 10`.

**Body row** (`flexDirection: row, gap: 14, minHeight: 124`):
- Left: SVG progress ring, size clamp(104…124) = `min(max(round(windowWidth*0.3),104),124)`, stroke 5 (track stroke 6), track color `rgba(119,93,216,0.12)`. Progress stroke is a diagonal SVG gradient of the tier colors: `0% highlight (#EDE9FE) → 30% primary (#775DD8) → 65% secondary (#6366F1) → 100% primary`, `strokeLinecap="round"`, starts at 12 o'clock (rot −90°). A second thin sheen arc (1.5px, 42% of circumference, opacity 0.75). Behind the ring: circular glow `backgroundColor 'rgba(139, 92, 246, 0.08)'`, shadow `#775DD8` opacity 0.5 radius 12, sized ring+16.
- Ring center: percent e.g. `68%` — fontSize 32 (28 if ≥100), fontWeight 900, letterSpacing −1.5, color `#1E1A3E`, `scaleY: 1.2`. Below it caption `Complete` — 7px / 800 / letterSpacing 2.6 / uppercase, marginTop 3, `scaleY 1.12`.
- Right: 4 metric rows (`gap: 10`), one per category — labels/colors: **Discipline `#775DD8`**, **Habits `#6366F1`**, **Mindset `#7C3AED`**, **Health `#5B21B6`**. Each row: 6×6 colored dot (radius 3, glow shadowOpacity 0.85 radius 4) + label 12px/500 color `#1E1A3E` + right-aligned value `NN%` 12px/700 tabular-nums. Below: 4px-high track (radius 999, `marginLeft: 12`, bg `rgba(119,93,216,0.12)`) with a fill bar in the category color.

### 3. Today's Schedule card (`TodaysScheduleCard.tsx`)
GlassPanel radius 26, inner `p-5` (20px).
- Header row (`mb-4`): title `Today's Schedule` — 11px / bold / uppercase / tracking 0.22em, color `#1E1A3E`. Right link `View All` — 12px / 600, color `#775DD8` (primaryNeon).
- Item rows (`px-1 py-3.5`, separator `borderBottom 1px rgba(119,93,216,0.14)` between rows): checkbox (see shared) + `ml-3.5` column: title `text-base font-semibold` (16px/600) `#1E1A3E` (completed: 45% opacity ink + line-through), and time below `text-xs` (12px) color `#7F7D9C` (e.g. "09:00").
- **Empty state**: dashed box `rounded-2xl border border-dashed px-4 py-6`, borderColor `rgba(119,93,216,0.14)`, bg `#775DD808`; centered text 14px, line-height 24, ink at 45%: `Your schedule is clear for today. Add a task to plan your focus blocks.`
- Bottom, centered (`marginTop: 16`): **Add task pill** (`AddTaskPillButton`): height 50, radius 25, min-width 196, bg `rgba(255,255,255,0.52)` (chip), border 1px `rgba(119,93,216,0.14)`, label `ADD TASK` (13px / 700 / letterSpacing 0.6 / uppercase, color `#8E89B3`) left + a 38×38 solid `#775DD8` circle at right containing white/ink lucide `Plus` (size 17, strokeWidth 2.6); circle shadow `#775DD8` opacity 0.26 radius 10.

### 4. Focus Streak card (`FocusStreakCard.tsx`)
Fixed height 124, radius 28, border 1px `rgba(255,255,255,0.60)`, bg `rgba(255,255,255,0.72)`. Full-bleed crystal photo (`crystall.png`) as cover image, overlaid by a **horizontal** scrim gradient (light `focusCard` preset): `['rgba(250,250,252,0.96)', 'rgba(250,250,252,0.82)', 'rgba(250,250,252,0.35)', 'rgba(250,250,252,0.08)']` at locations `[0, 0.38, 0.62, 0.88]` left→right (so text sits on frosted left, crystal art shows right).
Copy block, `paddingLeft: 40`, vertically centered, self-start column, center-aligned:
- Kicker `FOCUS STREAK` — 10px / 700 / letterSpacing 2.2 / uppercase, color `#8E89B3`.
- Big number e.g. `12` — 44px / 800 / letterSpacing −1.5 / lineHeight 46, color `#775DD8`; when streak is active it gets text glow `rgba(119,93,216,0.28)` radius 12.
- Unit `DAYS` (or `DAY`) — 12px / 600 / letterSpacing 2.4 / uppercase, color `#7F7D9C`, marginTop −2.

### 5. Health card (`DashboardHealthCard.tsx` + `useDashboardHealthStyles.ts`)
One tall card, radius 28, border `rgba(255,255,255,0.60)`, split into two stacked halves.

**Top half — Workout (image half).** Height = (screenWidth − 40) × 0.5, `today_widget_bg.png` cover image with left→right scrim `['rgba(247,248,252,0.94)','rgba(247,248,252,0.82)','rgba(247,248,252,0.45)','rgba(247,248,252,0.12)']` locations `[0,0.35,0.62,1]`. Content padding `20 h / 16 v`, vertically centered:
- Header row: 38×38 icon shell (radius 13, bg `#775DD812`, border `#775DD820`) containing lucide `Dumbbell` (color `#775DD8`, 14, sw 2.1) + `UtensilsCrossed` (color `#9580E8`, 13) side by side; next to it `Health` (14px/800 `#1E1A3E`) over `Today` (11px/600 `#7F7D9C`). Far right: 34×34 round chevron button (radius 17, bg `rgba(255,255,255,0.55)`, border `rgba(119,93,216,0.14)`) with `ChevronRight` `#775DD8` 18/2.2.
- Default (scheduled) state: left column — workout title e.g. `Push Day` (18px/900, letterSpacing −0.4, `#1E1A3E`), muscle-group meta (12px/600 `#7F7D9C`), and meta line \`{N} exercises · ≈{M} min · +{XP} XP\`. Right: 54px progress ring (stroke 5, track `rgba(119,93,216,0.12)`, fill `#775DD8`, centered `0%` label 11px/800).
- CTA button: full-width, `borderRadius: 14, paddingVertical: 13`, solid `#775DD8`, centered row of `Play` icon (15, fill+color = ink `#1E1A3E`) and label `Start workout` (14px/800, color `#1E1A3E`). Other states: `Continue workout` / `View report` / `View program`.
- Footer line centered: streak text, 11px/600 `#8E89B3`, e.g. `Streak · 12 days` or `2 of 4 workouts this week`.

**Bottom half — Nutrition panel.** `paddingHorizontal 16, paddingTop 16, paddingBottom 18, borderTopWidth 1` (borderSubtle), bg `rgba(255,255,255,0.72)`:
- Header: 36×36 icon shell (radius 12, same purple tint) with `UtensilsCrossed` `#775DD8` 16; `Nutrition` (14px/800) over `Today's fuel` (11px/600 `#7F7D9C`); right 34×34 chevron button.
- Calorie hero row: big number e.g. `1,860` — 30px/900, letterSpacing −1 — with `of 2,200 kcal` below (12px/600 `#7F7D9C`); right side a 56px ring with `85%` center. (If goal hit: green `Sparkles` 14 + `Daily goal hit` 11px/800 `#059669` above the number.)
- Full-width progress bar: 6px, radius 999, track `rgba(119,93,216,0.08)` (divider), fill `#775DD8` (green `#059669` at 100%), `marginTop 10`.
- Macro row (3 chips, gap 8, marginTop 14): each chip flex-1, radius 14, padding 10, bg `rgba(255,255,255,0.52)`, border `rgba(119,93,216,0.14)`; label letter `P`/`F`/`C` (10px/700 `#8E89B3`), value e.g. `82g` (14px/800 `#1E1A3E`), 4px mini progress bar — colors P `#6366F1`, F `#F59E0B`, C `#34D399`.
- Water card (radius 16, chip bg, marginTop 12): left `Droplets` `#775DD8` 15 + `1.2 / 3.0 L` (13px/700); right pill button `+250 ml` (radius 999, bg `#775DD812`, border `#775DD828`, `Plus` 14 + text 11px/800 `#775DD8`). Below: 6px water bar, fill `#38BDF8`.
- Meal-slot row (4 slots, gap 6, marginTop 12): each flex-1, radius 12, `paddingVertical 8`; pending: bg `rgba(255,255,255,0.35)` + subtle border; logged: bg `rgba(52,211,153,0.12)`, border `rgba(52,211,153,0.28)`. Big letter (first char, 12px/800; green when logged) over slot name (9px/700 `#7F7D9C`) — slot names come from `SLOT_LABELS` (Breakfast / Lunch / Dinner / Snack).
- `Log meal` button: full width, radius 14, `paddingVertical 12`, chip bg + subtle border, `Plus` `#775DD8` 15/2.5 + `Log meal` 13px/800 `#775DD8`.

### 6. Finance card (`DashboardFinanceCard.tsx` + `useDashboardFinanceStyles.ts`)
Radius 28 shell, `cardFrosted` bg + BlurView, padding `16 h / 14 v`.
- Header: 34×34 icon shell (radius 12, bg `#775DD814`, border `#775DD822`) with `Wallet` `#775DD8` 18/2; `Finance` (13px/800, letterSpacing 0.2) over month label e.g. `July 2026` (11px/600 `#7F7D9C`); right 34×34 chevron button.
- Balance block: value e.g. `$12,480` — 32px/900, letterSpacing −1.2, `#1E1A3E`; caption `Total balance · USD` (11px/600 `#7F7D9C`); optional currency chips (10px/700, bg `#775DD810`, pill); trend row `TrendingUp` 13 + `+4% vs last month` (11px/700, green `#059669` up / red `#E11D48` down).
- Divider: 1px `rgba(119,93,216,0.08)`, `marginVertical: 10`.
- Two mini flow cards side-by-side (gap 8): radius 16, bg chip `rgba(255,255,255,0.52)`, border `{accent}22`; header `ArrowUpRight`/`ArrowDownRight` 13/2.4 + label `Income`/`Expense` (10px/700 uppercase, letterSpacing 0.8, `#8E89B3`); value 16px/900 in accent (`#059669` / `#E11D48`).
- Divider, then **Goal card** (radius 16, chip bg): `TrackItIcon target` 15 `#775DD8` + goal name (14px/800); amounts `$4,000 of $10,000` (11px/600 `#7F7D9C`); 6px progress bar (track `rgba(255,255,255,0.55)`, fill `#775DD8`); `40%` (11px/800). Complete variant: green bg `rgba(52,211,153,0.12)`, `Sparkles` + `Goal reached!` (12px/800 `#059669`), link `Create a new goal` (12px/700 `#775DD8`). No goal: dashed button, text `Create goal` (13px/700 `#775DD8`).
- Divider, then **Last transaction** section: kicker `LAST TRANSACTION` (10px/700 uppercase letterSpacing 1.2 `#8E89B3`); row of category icon in 32px badge + label (14px/800) + relative time (10px/600 `#7F7D9C`) + right-aligned signed amount (14px/900; green if positive).
- **Markets carousel**: kicker `MARKETS` (same kicker style); horizontal snap cards 146px wide (radius 16, bg `rgba(255,255,255,0.52)`, border `{accent}28`): symbol badge pill (`BTC` `#F59E0B`, `ETH` `#6366F1`, `AAPL` `#94A3B8`, `NVDA`, `USD/RUB` `#34D399`, `EUR/RUB` `#38BDF8` — 10px/800 on `{accent}18` pill), change `+2.3%` 10px/800 (green `#34D399` / red `#F87171`), name 11px/600 `#7F7D9C`, price 14px/900, 118×28 sparkline in change color.
- Action row (gap 8, marginTop 12): two flex-1 buttons, radius 14, `paddingVertical 12`, `Plus` 15/2.5 + label 13px/800 — **Income** (green: bg `rgba(5,150,105,0.08)`, border `rgba(5,150,105,0.2)`, text `#059669`) and **Expense** (purple: bg `#775DD810`, border `#775DD828`, text `#775DD8`).
- Empty/fresh-user variant: header + dashed empty box with `Welcome!` (16px/800), `Add your first transaction to track income, expenses, and trends.` (13px, center), solid purple CTA `Add first transaction` (radius 14, 14px/800).

---

## SCREEN 2 — PLANNER (`src/screens/PlannerScreen.tsx`)

Order: Header → Month calendar → Today's Focus → Tasks → Workouts → Nutrition → Finance → Stats → Projects. All cards are `PlannerPremiumCard` (radius 28, border `rgba(119,93,216,0.14)`, bg `rgba(255,255,255,0.72)`, marginBottom 14). Standard module inner padding: `paddingHorizontal 18, paddingTop 18, paddingBottom 16`.

### 1. Header (`PlannerScreenHeader.tsx`)
- Top row (marginBottom 16): left menu button (lucide `Menu`, `#1E1A3E`, 22/1.5, 40×40 plain). Right: 44×44 circle button (radius 22, bg `rgba(255,255,255,0.72)` chipStrong, border `rgba(119,93,216,0.14)`) with lucide `Bell` `#775DD8` 20/2.
- Title block (gap 6, whole header marginBottom 20): screen title `PLANNER` — **34px / 900 / letterSpacing 1.2**, color `#1E1A3E`. Date line below — e.g. `Thursday, July 16, 2026` (en-US long format: weekday, month, day, year) — 14px/600, lineHeight 20, `#7F7D9C`.

### 2. Month calendar card (`PlannerMonthCalendar.tsx`)
Inner `paddingHorizontal 18, paddingTop 16, paddingBottom 18`.
- Header row: `ChevronLeft` / `ChevronRight` (color `#7F7D9C`, 20/2, in 32×32 slots) flanking centered month label `JULY 2026` — 13px / 800 / letterSpacing 1.4 / uppercase, `#7F7D9C`.
- Weekday row (marginBottom 8): `SUN MON TUE WED THU FRI SAT` — each flex-1 centered, 10px/600, letterSpacing 0.8, `#8E89B3`.
- Grid: 7 columns (each cell width 100/7 %, `paddingVertical 4`, centered). Day bubble 34×34, radius 17. Numbers 15px/600 `#1E1A3E`; days outside month at 55% opacity with muted color `#8E89B3`. Selected/today bubble: solid `#9580E8` (primaryLight) fill, text 15px/**800** `#1E1A3E`.

### 3. Today's Focus card (`PlannerTodayFocusCard.tsx`)
- Section header (shared `PlannerSectionHeader`, marginBottom 14): title `TODAY'S FOCUS` — 11px/700, letterSpacing 2.4, uppercase, `#1E1A3E`; subtitle `2 of 3 habits` (or `Habits for today`) — 12px/600 `#8E89B3`; right action `Edit` — 12px/700 `#8E89B3` (only when a journal entry exists).
- Journal body text: 15px/500, lineHeight 24, `#1E1A3E`, max 4 lines. Empty placeholder (muted, 14px/500 lh22 `#8E89B3`): `Write today's goal, focus, or a short reflection — it sets the rhythm for your whole ecosystem.`
- Empty-state button (marginTop 14): dashed pill — radius 16, `borderStyle: dashed`, borderColor `rgba(119,93,216,0.18)`, bg `rgba(255,255,255,0.55)`, `paddingVertical 12`; `Plus` (`#7F7D9C`, 16/2.2) + `Add entry` (13px/700 `#7F7D9C`).
- Habits block (marginTop 16, hairline top border `rgba(119,93,216,0.08)`, paddingTop 14, gap 10): kicker `HABITS` (10px/700, letterSpacing 2, uppercase, `#8E89B3`), then rows: checkbox + label 14px/600 `#1E1A3E` (done: muted + line-through).

### 4. Tasks card (`PrioritizedTasksSection.tsx`)
- Section header: `TASKS` + subtitle `1/3 tasks · 2/5 subtasks` (or `Plan your day`), action `View All`.
- Action bar (when tasks exist, marginBottom 14): full-width **New task** pill (same AddTaskPillButton anatomy: 50h, radius 25, chip bg, `NEW TASK` uppercase label 13px/700 `#8E89B3`, 38px purple `+` circle).
- Task cards: radius 18, border `rgba(119,93,216,0.14)`, bg `rgba(255,255,255,0.82)` (inset), padding `14 h / 12 v`, 10px gap between. Row: checkbox + title 15px/700 `#1E1A3E` (done: `#8E89B3` + line-through) + optional time 12px/500 `#7F7D9C` below. Right side: if subtasks — progress pill `2/4` (radius 999, minWidth 42, bg `#9580E833`, text 11px/700 `#6249C0`; complete: bg `rgba(52,211,153,0.18)`, text `#059669`); else a `ChevronRight` `#8E89B3` 18.
- Subtask rows: indented (`marginLeft 12, paddingLeft 8`) with a 1px left border `rgba(119,93,216,0.08)`; checkbox + title 13px/600 `#7F7D9C`.
- Inline `+ Add subtask` trigger (marginLeft 34): `Plus` `#775DD8` 14/2.5 + text 12px/600 `#775DD8`. Expands to a text input (radius 12, chipStrong bg, placeholder `Subtask title`) + solid purple `Add` button (radius 12, text 12px/700 white).
- Empty state: radius-18 inset box, `No tasks for this day` (15px/700) + `Start with one clear task — you can add subtasks while creating it.` (13px/500 `#8E89B3`, centered, lh20) + New task pill.

### 5. Workouts module (`PlannerWorkoutModule.tsx`)
- Header: `WORKOUTS`, subtitle \`{programTitle} · ~{estimatedMinutes} min\`, action `Open`.
- Hero row: radius 20 inset panel (padding 14, bg `rgba(255,255,255,0.82)`): 44×44 icon square (radius 14, bg `rgba(119,93,216,0.1)`) with `Dumbbell` `#775DD8` 20/2; middle: focus name 16px/800 `#1E1A3E` + meta line `5 exercises · sets, reps & PRs in Health` (13px/600 `#7F7D9C`, lh20); right: 36×36 solid `#775DD8` circle with white `Play` (14, filled).
- Footer (marginTop 12): `Open Health for the full workout card` — 12px/600 **green `#34D399`** — with `ChevronRight` `#8E89B3` 18.

### 6. Nutrition module (`PlannerNutritionModule.tsx`)
- Header: `NUTRITION`, subtitle `1860 / 2200 kcal`, action `Open`.
- Row (gap 16): 72px calorie ring (stroke 7, track `rgba(119,93,216,0.12)`, fill `#775DD8`, round cap, center `85%` 14px/900) + right column of three lines (gap 8, space-between per line): `Protein` `82 / 140 g`, `Fat` `55 / 70 g`, `Carbs` `210 / 250 g` — label 12px/600 `#8E89B3`, value 12px/700 `#1E1A3E`.
- Timeline (marginTop 14, gap 8): two inset rows (radius 14, bg `rgba(255,255,255,0.82)`, padding `12 h/10 v`): `UtensilsCrossed` `#775DD8` 16 + `Meal timeline in Health`; `Droplets` `#34D399` 16 + `Water 1.2 / 3.0 L (40%)` — text 12px/600 `#7F7D9C`.

### 7. Finance module (`PlannerFinanceModule.tsx`)
- Header: `FINANCE`, subtitle `$5.2K in · $3.1K out` (compact) or `No activity this month`, action `Open`.
- Balance: 28px/900, letterSpacing −0.8, `#1E1A3E`; caption `Balance · {cardholder}` 12px/600 `#8E89B3`.
- Flow row (gap 10, marginTop 14): two pills (radius 16, padding `12/10`): income — border `rgba(52,211,153,0.2)`, bg `rgba(52,211,153,0.08)`, `TrendingUp` `#059669` 14; expense — border `rgba(248,113,113,0.2)`, bg `rgba(248,113,113,0.08)`, `TrendingDown` `#F87171` 14. Inside: label `INCOME`/`EXPENSE` (10px/700, letterSpacing 1.2, uppercase, `#8E89B3`) + value 13px/800 `#1E1A3E`.
- Goal row (marginTop 12): inset row (radius 14) with `Wallet` `#775DD8` 16 + `Goal {name} · {percent}%` 12px/600 `#7F7D9C`.

### 8. Stats module (`PlannerStatsModule.tsx`)
- Header: `STATS`, subtitle `Level 12 · {username}`, action `Open`.
- 3 tiles (gap 10): flex-1, radius 16, inset bg, padding `10 h/12 v`, gap 6. Tile 1: `Sparkles` `#775DD8` 16, label `XP`, value `340 / 500`. Tile 2: `Flame` `#9580E8` 16, `STREAK`, `12 days`. Tile 3: `BarChart3` `#818CF8` 16, `WORKOUTS`, `48`. Labels 10px/700 uppercase letterSpacing 1.2 `#8E89B3`; values 15px/900 `#1E1A3E`.
- XP bar (marginTop 14): 8px tall, radius 999, track `rgba(255,255,255,0.55)`, fill `#9580E8`.
- Caption: `Progress to level 13 · heatmaps and charts in Analytics` — 12px/600 `#8E89B3`, lh18.

### 9. Projects timeline (`ProjectsTimelineSection.tsx`)
Inner padding 18 all around.
- Header: `PROJECTS`, subtitle `2 active · 1 done` (or `Your next few days at a glance`), action `View All`.
- **4-day strip** (gap 8, marginBottom 14): each cell flex-1, radius 16, inset bg + border; weekday `THU` 10px/700 uppercase `#8E89B3`; day number `16` 18px/900 tabular; today cell: border `rgba(124,92,252,0.35)`, bg `rgba(124,92,252,0.08)`, weekday in `#9580E8`, plus a `TODAY` pill (radius 999, solid `#775DD8`, text 9px/800 white uppercase). Non-today cells with tasks show a small count badge (18px round, bg `rgba(124,92,252,0.1)`, 10px/800).
- **Task cards** (gap 10): radius 18, white `#FFFFFF` bg, border subtle, with a 4px colored left accent stripe — accents cycle `['#7C5CFC', '#6366F1', '#38BDF8', '#34D399']` by day index. Body padding `14 h/12 v, gap 10`: title 15px/700 lh20; meta `Thu 16 · 14:00 · 2/5 steps` 12px/500 `#8E89B3`; right badge — percent chip `40%` (radius 12, bg `rgba(124,92,252,0.1)`, border `rgba(124,92,252,0.14)`, 12px/900 `#9580E8`) or, when complete, 32px round green check badge (bg `rgba(16,185,129,0.12)`, `Check` `#10B981` 14/3). Bottom: 6px progress bar (track `rgba(124,92,252,0.08)`) with gradient fill `[accent → #775DD8]` (complete: `['#6EE7B7','#10B981']`).
- Empty state: dashed radius-18 box, 44px icon square with `CalendarRange` `#9580E8` 22/2.2, `No projects yet` (15px/800) + `Tasks due in the next four days show up here with clear progress and due dates.` (13px/500 centered, maxWidth 260).

---

## BOTTOM TAB BAR + FAB (shared, `FloatingTabBar.tsx`, `useFloatingTabBarStyles.ts`, `ActionHubButton.tsx`)

- **4 tabs + center crystal FAB**. Left: Dashboard (`LayoutDashboard`), Planner (`CalendarDays`); right: Health (`Dumbbell`), Analytics (`BarChart3`). Icons only — **no text labels**. Icon size 23.
- Bar: full-width edge-to-edge panel pinned to bottom (not a floating pill). `borderTopWidth 1` color `rgba(255,255,255,0.60)`; bg `rgba(255,255,255,0.75)` over blur (intensity 20); `paddingTop 10`, icon row height 38, `paddingHorizontal 16`, bottom padding = safe-inset + 12. Web adds `boxShadow: '0 -4px 24px rgba(15, 12, 30, 0.08)'`.
- Inactive icon: color `#7F7D9C`, strokeWidth 1.15, opacity 0.38. Active: color `#775DD8`, strokeWidth 1.6, scale 1.1, full opacity, plus a **4×4 glowing dot** 8px below the icon (radius 2, `#775DD8`, shadowOpacity 0.95 radius 5).
- **FAB — "Action Hub crystal"**: 70px circular medallion centered over the bar (its center aligns with the tab icon centers, so ~half protrudes above the bar top). Outer medallion: border 1px `rgba(255,255,255,0.72)`, bg `rgba(255,255,255,0.42)` (iOS blur) / `rgba(255,255,255,0.94)` solid otherwise, shadow `#775DD8` offset 0/10, opacity 0.14, radius 22. Inner glow ring `rgba(124,92,252,0.22)`. Inner disk (size−14, so 56px): border `rgba(255,255,255,0.85)`, filled with a diagonal gradient `['#FFFFFF', '#F8F7FF', '#F3F1FF']`. Center icon: `CrystalEmblemIcon` — a sharp diamond polygon (points `12,3 21,12 12,21 3,12` with inner diamond at 35% opacity), color `#7C5CFC`, size ≈ 25 (70×0.36). Note: it's **not** a purple gradient FAB — it's a white glass medallion with a purple crystal glyph. (The brand gradient `['#9580E8','#775DD8']` from `GRADIENTS.fab` exists in tokens but this crystal design is what renders.) Optional 9px amber overdue dot (`#F59E0B`, white 1.5px border) at top-right.

### Copy strings quick reference
Dashboard: `Dashboard`, `Overall Progress`, `TIER D…SS`, `Complete`, `Discipline/Habits/Mindset/Health`, `Today's Schedule`, `View All`, `Add task`, `FOCUS STREAK`, `DAYS`, `Health`/`Today`, `Start workout`, `Continue workout`, `View report`, `View program`, `Nutrition`/`Today's fuel`, `of 2,200 kcal`, `Daily goal hit`, `+250 ml`, `Log meal`, `Finance`, `Total balance · USD`, `% vs last month`, `Income`, `Expense`, `Last transaction`, `Markets`, `Create goal`, `Goal reached!`, `Add first transaction`, `Welcome!`.
Planner: `PLANNER`, date line, `JULY 2026`, `SUN…SAT`, `TODAY'S FOCUS`, `HABITS`, `Add entry`, `Edit`, `TASKS`, `New task`, `Add subtask`, `No tasks for this day`, `WORKOUTS`, `Open`, `NUTRITION`, `Protein/Fat/Carbs`, `Meal timeline in Health`, `Water … L`, `FINANCE`, `Balance ·`, `STATS`, `XP`, `Streak`, `Workouts`, `Progress to level N · heatmaps and charts in Analytics`, `PROJECTS`, `TODAY`, `steps`, `No projects yet`, `View All`.