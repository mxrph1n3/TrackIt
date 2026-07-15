Both screens are fully mapped. Below is the structured report, top to bottom, with exact strings, style objects, and colors quoted from the source.

---

# Shared foundation (applies to both screens)

**Theme values (Ethereal light)** from `src/theme/designTokens.ts` + `src/theme/themes.ts`:

- `background: '#F3F5FA'`, screen also has an ambient background layer (`ScreenAmbientBackground`)
- `card: 'rgba(255, 255, 255, 0.75)'`, `cardFrosted: 'rgba(255, 255, 255, 0.72)'`
- `border: 'rgba(255, 255, 255, 0.60)'` (glass card border), `borderSubtle: 'rgba(119, 93, 216, 0.14)'`
- `primary / primaryNeon: '#775DD8'`, `primaryLight: '#9580E8'`, `primaryDeep: '#6249C0'`, `accent: '#818CF8'`
- Text: `textPrimary: '#1E1A3E'`, `textSecondary: '#7F7D9C'`, `textMuted: '#8E89B3'`
- `ringTrack: 'rgba(119, 93, 216, 0.12)'` (all progress-bar tracks)
- Radii: `control: 14`, `inset: 20`, `card: 28`, `sheet: 28`
- Semantic: income soft `#34D399`, expense soft `#F87171`, warning `#F59E0B`
- Shadows: `shadowColor: '#775DD8'`, glass card shadow = `{ shadowOffset: {0,4}, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 }`

**GlassPanel** (`src/components/GlassPanel.tsx`): outer shadow shell → inner wrapper `overflow: hidden` with `backgroundColor: theme.card` (white 0.75), `borderWidth: 1`, `borderColor: rgba(255,255,255,0.60)`, radius per-card (default 28). Blur only on iOS; on web/Android a solid frosted fill.

**Tailwind class → color** (from `tailwind.config.js`): `text-ethereal-ink` = `#1E1A3E`, `text-ethereal-slate` = `#7F7D9C`, `text-obsidian-primary` = `#775DD8` (legacy alias), `text-emerald-400` = `#34D399`, `text-red-400` = `#F87171`. Font weights: `font-black` = 900, `font-bold` = 700, `font-semibold` = 600. Sizes: `text-[10px]`, `text-xs` = 12, `text-sm` = 14, `text-base` = 16, `text-xl` = 20, `text-2xl` = 24, `text-4xl` = 36.

---

# Screen 1 — Finance (`src/screens/FinanceScreen.tsx`)

Screen shell: `IsolatedScreenShell` (background `#F3F5FA` + ambient glow). Content scrolls with `paddingBottom: 16`; sections mostly have `marginBottom: 16` and horizontal screen padding 18.

## 1. Header (`ScreenHeader`)
- Optional back button on the left: 40×40 circle (`rounded-full`), background `#775DD818` (primary at ~9% alpha), lucide `ChevronLeft` in `#775DD8`, size 22, strokeWidth 2.5.
- Kicker (subtitle above title): **"Personal Wealth OS"** — 11px, weight 700, uppercase, `tracking-[2px]`, color `#8E89B3` (textMuted).
- Title: **"FINANCES"** — 24px (`text-2xl`), weight 900 (`font-black`), color `#1E1A3E`, `mt-1`.

## 2. Balance hero (`BalanceHeroWidget`)
GlassPanel radius **28**, wrapped LinearGradient (diagonal, top-left→bottom-right): `['#775DD828', 'rgba(255,255,255,0.08)', '#775DD812']`, `padding: 20`, `borderRadius: 28`, shadow `{ shadowColor: '#775DD8', shadowOpacity: 0.15, shadowRadius: 20 }`.
- Kicker: **"Total Balance"** — 10px, 700, uppercase, tracking 2px, `#8E89B3`.
- Balance number (`AnimatedBalanceText`, count-up animation): 36px (`text-4xl`), weight 900, color `#1E1A3E`. Money format from `formatMoney`: space thousands separator, e.g. **`128 450 ₽`** (symbol after amount for RUB/KZT/UAH, before for `$128,450`-style → actually `$128 450`).
- Change pill (bottom-left): rounded-full, `px-3 py-1`, background = changeColor at `18` alpha; text 12px bold in `#34D399` if positive / `#F87171` if negative: **"+12% vs last month"**.
- Sparkline (bottom-right): SVG `Polyline`, 120×36, stroke `#775DD8`, strokeWidth 2, round caps/joins, no fill.
- Optional multi-currency pills: rounded-full `px-2.5 py-1`, bg `#775DD812`, text 10px bold `#7F7D9C`, e.g. `$1 200`.
- Footer line: **"This month · +12 400 ₽"** (`formatSignedMoney`, `−` U+2212 for negative) — 12px, 600, `#8E89B3`, `mt-3`.

## 3. Income / Expense cards (`FinanceCashFlowCards`)
Two GlassPanels radius **20**, side by side (`flex-row gap-3`), inner `p-4`:
- Left: lucide `ArrowUpRight` (`#34D399`, 14, strokeWidth 2.4) + label **"Income"** (10px, 700, uppercase, wide tracking, emerald `#34D399`); value 20px (`text-xl`) weight 900, `#34D399`.
- Right: lucide `ArrowDownRight` (`#F87171`) + **"Expenses"**, value 20px 900 in `#F87171`.

## 4. Statistics card (`FinanceStatsSection`)
GlassPanel radius **24**, `p-5`.
- Kicker: **"Statistics"** — 10px 700 uppercase tracking 2px `#8E89B3`.
- Period segmented row (4 equal pills, `rounded-xl py-2`, gap 2): labels **"Week" / "Month" / "3 Mo" / "Year"** — 10px 700 uppercase centered. Active: bg `#775DD8`, text `#1E1A3E`; inactive: bg `#775DD812`, text `#8E89B3`.
- Bar chart: SVG 280×100, one `Rect` per period bucket, `rx={4}`, fill `#775DD8`, opacity 0.85, bars bottom-aligned.
- Stat chips grid (2×2, `gap-x-4 gap-y-2`), each `min-w-[45%]`: label 9px 700 uppercase `#7F7D9C` + value 14px 900 colored — **"Income"** `#34D399`, **"Expense"** `#F87171`, **"Savings"** `#775DD8`, **"Avg. ticket"** `#7F7D9C`. Values via `formatMoney`.
- Empty state: **"Not enough data for this period."** (14px, `#8E89B3`, centered).

## 5. Spending by Category (`CategoryBreakdownSection`)
GlassPanel radius **24**, `p-5`, `marginBottom: 16`.
- Kicker: **"Spending by Category"** — same 10px kicker style.
- Per category row (`mb-3`): left = category icon (lucide via `TrackItIcon`, size 16, tinted category color) + name 14px 600 `#1E1A3E`; right = **"42% · 12 300 ₽"** 12px bold `#8E89B3`. Below: progress bar h-2 (8px), track `rgba(119,93,216,0.12)`, fill rounded-full, width `${percentage}%`, color = category color.
- Empty state: **"No expenses logged this month."**

Category icon/color table (`src/constants/financeCategories.ts`) — expense: Food `utensils` `#775DD8`, Cafe `coffee` `#9580E8`, Groceries `shopping-cart` `#7C3AED`, Transport `car` `#6366F1`, Fuel `fuel` `#4F46E5`, Home `home` `#818CF8`, Utilities `zap` `#60A5FA`, Subscriptions `smartphone` `#38BDF8`, Entertainment `gamepad-2` `#34D399`, Shopping `shopping-bag` `#F472B6`, Health `pill` `#FB7185`, Sport `dumbbell` `#F97316`, Education `book-open` `#EAB308`, Travel `plane` `#2DD4BF`, Pets `dog` `#FB923C`, Gifts `gift` `#9580E8`, Other `wallet` `#94A3B8`. Income: Salary `briefcase` `#34D399`, Freelance `banknote` `#10B981`, Investments `trending-up` `#6366F1`, Gifts `gift` `#F472B6`, Cashback `circle-dollar-sign` `#22D3EE`, Bonuses `trophy` `#FBBF24`, Sales `package` `#A78BFA`, Other `plus` `#94A3B8`. (Icon names are lucide kebab-case; `TrackItIcon` maps them to `Utensils`, `Coffee`, etc., default strokeWidth 2.)

## 6. Donut (`ExpensePieChart`)
Rendered right after the breakdown, centered, no card of its own. SVG 168×168, ring built from stroked `Circle` segments: strokeWidth **18**, radius `size/2 − 8`, rotated −90° (starts at 12 o'clock), colors = category colors. Center hole: filled circle `r = radius − 22`, fill **`#07070A`** (note: a legacy dark fill, visibly near-black in the light theme). Legend below (`mt-4`, top-3 categories only): 10px dot (`h-2.5 w-2.5 rounded-full`, category color) + name 14px `#1E1A3E`, right-aligned **"42%"** 14px 600 `#7F7D9C`.

## 7. Boss Battle (`FinanceBossTracker`)
GlassPanel radius **24**, `p-5`.
- Header row: lucide `Skull` 18px strokeWidth 2.2 — red `#F87171` while active, `#34D399` when done; title **"Boss Battle"** (or **"Boss Defeated!"**) 14px 900 `#1E1A3E`; right side **"64% damage"** 12px 900 `#775DD8`.
- Goal name 16px 900 `#1E1A3E`; under it **"32 000 ₽ / 50 000 ₽"** 12px 600 `#7F7D9C`.
- Progress bar `mt-3`, h-2.5 (10px), rounded-full, track `rgba(119,93,216,0.12)`, fill `bg-red-400` (`#F87171`), animated width.
- No-goal state: Skull in `#775DD8` + copy **"Create a savings goal to start a boss battle — every deposit deals damage."** (14px, line-height 20, `#7F7D9C`).

## 8. Last Transaction (`FinanceLastTransactionCard`)
GlassPanel radius **24**, `p-5`. Kicker **"Last Transaction"**. Row: label 16px 900 `#1E1A3E`; sub-line **"{Category} · Recently"** 12px 600 `#7F7D9C`; right amount 16px 900, `−12 300 ₽` in `#F87171` or `+…` in `#34D399` (uses `−`/`+` prefix characters).

## 9. Recent Operations (`TransactionHistorySection`)
GlassPanel radius **24**, `p-5`.
- Header row: kicker **"Recent Operations"**; if category-filtered, right link **"Clear filter"** (10px bold `#775DD8`) and a pill with the category label (rounded-full `px-3 py-1`, bg `#775DD818`, 12px 600 `#775DD8`).
- Search input: placeholder **"Search transactions…"**, `rounded-xl` (12px), border 1px `rgba(119,93,216,0.14)`, bg `#775DD808`, `px-4 py-3`, 14px 500 text.
- Type filter pills: **"All" / "Expense" / "Income"** — rounded-full `px-3 py-1.5`, 10px 700 uppercase; active bg `#775DD8` text `#1E1A3E`; inactive bg `#775DD810` text `#8E89B3`.
- Transaction row (`mb-3`): 40×40 `rounded-xl` icon tile, bg `#775DD814`, category lucide icon 18px in `#775DD8`; middle column — label 14px 700 `#1E1A3E`, **"{Category} · {Account}"** 12px `#8E89B3`, date 10px `#8E89B3` (**"Today · 2:41 PM"** or **"Jul 12"**); right amount 14px 900 — income `#34D399`, expense `#1E1A3E`, formatted `+/−` signed.
- Empty states: **"No operations yet."** / **"No matches found."**

## 10. Subscriptions (inside `ExpandableSection`)
`ExpandableSection`: GlassPanel radius **20**; header `px-4 py-4` with title **"Subscriptions"** (11px 700 uppercase `tracking-widest`, `#1E1A3E`) + subtitle **"Recurring payments"** (12px `#7F7D9C`), right lucide `ChevronDown` 18px `#7F7D9C` (rotates 180° when open).
Content (`SubscriptionsSection`):
- Each subscription: `rounded-xl` row, border 1px `rgba(119,93,216,0.14)`, bg `#775DD806`, `px-3 py-3`; name 14px 600 `#1E1A3E`; sub-line **"Next · {date} · monthly"** 12px `#8E89B3`; right amount 14px 700 `#1E1A3E`.
- Totals: two side-by-side `rounded-xl` boxes, border `#775DD844`, bg `#775DD812`; labels **"Monthly"** / **"Yearly"** 9px 700 uppercase `#8E89B3`; values 14px 700 in `#775DD8`.
- Add link: **"+ Add subscription"** — centered, 12px bold `#775DD8`. Empty state: **"No active subscriptions tracked."** + solid `#775DD8` button (**"Add Subscription"**, `rounded-xl px-4 py-2`, 14px bold). Form fields: placeholders **"Service name"**, **"Amount"**, cycle pills **"Monthly"/"Yearly"**, submit **"Save Subscription"**.

## 11. Savings Goals (inside `ExpandableSection`)
Header title **"Savings Goals"**, subtitle **"Boss roster"**.
Content (`SavingsGoalsSection`): horizontal scroll of cards `w-52` (208px), `rounded-2xl` (16px), border `rgba(119,93,216,0.14)`, bg `#775DD808`, `p-4`:
- Goal icon in circular badge (44px shell, bg = goal color at 18 alpha, icon 22px in goal color).
- Name 14px 700 `#1E1A3E`; **"12 000 ₽ / 50 000 ₽"** 12px `#8E89B3`; optional **"Target · Dec 31, 2026"** 10px.
- Progress bar h-2 rounded-full, track `rgba(119,93,216,0.12)`, fill goal color; footer **"24% complete"** 12px bold `#775DD8`.
- Trailing "add" tile: `w-28 min-h-[140]` dashed-looking bordered box, big **"+"** (24px) and **"Add"** 12px bold `#775DD8`. Empty state: **"No savings goals yet."** + **"Add Goal"** button. Form: **"Goal name (e.g. MacBook)"**, **"Target amount"**, **"Create Goal"**.

## 12. Smart Tips (`FinanceTipsCard`)
`rounded-3xl` (24px) with border `#775DD8` at 25% alpha; LinearGradient fill `['rgba(99,102,241,0.22)', 'rgba(168,85,247,0.12)', 'rgba(7,7,10,0.95)']` diagonal, `padding: 20` (note: last stop is near-black — this card reads as a dark gradient card).
- Header: lucide `Lightbulb` 18px `#775DD8` + **"Smart tips"** 11px 700 uppercase tracking-widest in `#775DD8`; subheader **"Based on your spending patterns"** 10px 600 uppercase `#7F7D9C`/80.
- Each tip: `rounded-2xl`, border `rgba(255,255,255,0.05)`, bg `rgba(0,0,0,0.2)`, `px-4 py-3`, text 14px lh-20 ink/90. Example tip strings: *"Spending exceeded income this month — review discretionary categories."*, *"Food accounts for 42% of your expenses this month."*, *"At your current pace, \"MacBook\" could be reached in ~3 months."*, fallback *"Log transactions with [+] to unlock personalized spending tips."*

## 13. Pinned bottom bar (`FinanceQuickControlBar`)
Fixed footer: `paddingHorizontal: 18, paddingTop: 10`, `borderTopWidth: 1, borderTopColor: '#775DD818'`, bg `#F3F5FA`. Two equal buttons (`gap: 10`), `rounded-2xl` (16px), `py-3.5`, centered row with lucide `Plus` (white, 18, strokeWidth 2.5) + label 14px 900 white:
- **"Income"** — bg `rgba(52, 211, 153, 0.92)`
- **"Expense"** — bg `rgba(248, 113, 113, 0.92)`

---

# Screen 2 — Analytics / Statistics (`src/screens/AnalyticsScreen.tsx`)

Transparent screen over `#F3F5FA` background; content `paddingTop: insets.top + 8`, screen horizontal padding from `screenLayout` (gutter ≈ 20).

Analytics cards use `StatisticsPremiumCard` (not GlassPanel): `borderRadius: 28`, `borderWidth: 1`, `borderColor: rgba(119,93,216,0.14)`, `backgroundColor: rgba(255,255,255,0.72)` (cardFrosted), `padding: 16`, `marginBottom: 14`, shadow `{ color: '#775DD8', opacity: 0.05, radius: 20, offset {0,8} iOS / elevation 3 Android }`.

## 1. Header (`StatisticsOverviewHeader`)
Row, space-between, `marginBottom: 18`:
- Left: hamburger button (`MenuHeaderButton`) — 40×40 hit area, lucide `Menu` icon, size 20, strokeWidth 1.5, color `#1E1A3E`.
- Center title: **"Statistics Overview"** — `fontSize: 11, fontWeight: '700', letterSpacing: 2.8, textTransform: 'uppercase'`, color `#1E1A3E`, centered.
- Right: empty 40×40 spacer (keeps title centered).

## 2. Tab switcher (`MetricTabSwitcher`)
GlassPanel radius **20**, `marginBottom: 16`; horizontal scroll, inner `padding: 8, gap: 8`. Tabs: **"Overview" / "Productivity" / "Finance" / "Health"** (non-overview tabs are Pro-gated). Tab pill: `borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1`; label `fontSize: 10, fontWeight: '700', letterSpacing: 1.6, uppercase`. Active (light): bg `rgba(119,93,216,0.12)`, border `rgba(119,93,216,0.28)`, purple glow shadow (radius 12, opacity 0.2), text `#1E1A3E`. Inactive: bg `rgba(119,93,216,0.12)` (ringTrack), border `rgba(119,93,216,0.14)`, text `#8E89B3`.

## 3. Free-tier banner (`AnalyticsFreeTierBanner`, hidden for Pro)
GlassPanel radius **18**, row `p-4 gap-3`: 36×36 circle bg `#775DD818` with lucide `Crown` (16px, strokeWidth 2.2, `#775DD8`); title **"Free analytics · last 7 days"** (13px, 800, `#1E1A3E`); body **"Upgrade to Pro for 4-week heatmaps, full history, and advanced insights."** (12px, lh 17, `#7F7D9C`); right label **"Pro"** (12px 800 `#775DD8`).

## 4. Overall Growth card (`OverallGrowthCard`)
StatisticsPremiumCard. Header row:
- Kicker **"Overall Growth"** — `fontSize: 11, fontWeight: '700', letterSpacing: 2, uppercase`, color `#1E1A3E`.
- Range under it — e.g. **"Last 7 Days (Jul 10–Jul 16)"** — 11px, 500, `#8E89B3`.
- Right big number: **"78%"** — `fontSize: 32, fontWeight: '900', letterSpacing: -1`, color `#775DD8`.

Line chart: SVG **300×120** (padding top 12 / bottom 24 / sides 8), y-scale 0–100:
- Area fill: vertical gradient `#775DD8` from `stopOpacity 0.28` → `0.02`, overall opacity ~0.35.
- Line: stroke `#775DD8`, strokeWidth 2.5, round caps/joins.
- Data dots: r=4, fill `rgba(255,255,255,0.72)` with 2px `#775DD8` stroke; the highlighted "today" dot is r=6 solid `#775DD8`.
- X labels (in-SVG text at y = height−6): **M T W T F S S**, fontSize 10, `#8E89B3` weight 600, today in `#775DD8` weight 700.

## 5. Habit Completion Heatmap (`HabitCompletionHeatmap`)
StatisticsPremiumCard. Header: kicker **"Habit Completion Heatmap"** (same 11px style) + range **"Last 4 Weeks"** (Pro) or **"Last 7 Days"** (free).
- Y-axis day labels: **MON TUE WED THU FRI SAT SUN** — 9px, 700, `#8E89B3`, letterSpacing 0.4, marginRight 10.
- Grid: cells **22×22**, gap **6**, `borderRadius: 6`. One column per week. Intensity colors: `≥0.85 → #775DD8`, `≥0.7 → rgba(119,93,216,0.72)`, `≥0.55 → rgba(129,140,248,0.55)`, `≥0.4 → rgba(168,148,232,0.35)`, else `rgba(119,93,216,0.12)`.
- X-axis labels under grid (`marginTop: 8`): **"W1" "W2" "W3" "W4"** (or single **"Week"**) — 9px 600 `#8E89B3`.
- Legend (`marginTop: 14`): 10×10 swatches radius 3 — `rgba(119,93,216,0.12)` **"Low"**, `rgba(129,140,248,0.55)` **"Moderate"**, `#775DD8` **"Complete"** — 10px `#8E89B3`, 6px gaps.

## 6. Two rows of mini bar charts (`StatisticsBarChartCard` ×4)
Two side-by-side cards per row (`flexDirection: 'row'`, 10px gap, rows `marginBottom: 14`). Each card:
- Kicker title — 10px 700 uppercase letterSpacing 1.6 `#1E1A3E`; subtitle 10px 500 `#8E89B3` (`marginTop: 3, marginBottom: 10`).
- SVG **148×88**; bars `rx={5}`, opacity 0.9, gap 8, bottom baseline 18px above card bottom; x labels are day-of-month numbers (e.g. "10 11 12 13 14 15 16"), fontSize 9, weight 600, `#8E89B3`.
- Peak caption centered under chart (`marginTop: 6`, 10px, 600, `#7F7D9C`): **"Peak: {value}"**.

The four cards and their accents (`STATISTICS_BAR_ACCENTS`):
1. **"Workouts"** / **"Weekly sessions (min)"** — bars `#775DD8`; peak e.g. **"Peak: 45 min"**
2. **"Nutrition"** / **"Daily calories"** — bars `#F59E0B`; **"Peak: 2100 kcal"**
3. **"Finance: Expenses"** / **"Daily spending ($)"** — bars `#F87171`; **"Peak: $120"**
4. **"Finance: Income"** / **"Daily income ($)"** — bars `#34D399`; **"Peak: $300"**

## 7. Global Leaderboard section (`LeaderboardOverviewSection` + `GlobalLeaderboard.tsx`)
Header row (`marginBottom: 12`): kicker **"Global Leaderboard"** (10px 700 uppercase tracking 2, `#8E89B3`) and right link **"View All"** (12px 600 `#775DD8`).

### Current user hero card (`CurrentUserRankCard`)
`LeaderboardGlassCard` hero: `rounded-3xl` (24px), border 1px in tier `capsuleBorder`, bg = tier primary at ~6% (`${tierTheme.primary}10`), tier glow shadow (strong: offset 0, opacity 0.55, radius 18), inner top sheen line (borderTop 1px tier `sheen`, overlay `rgba(255,255,255,0.35)`), plus a diagonal `LinearGradient` wash `[tierPrimary+'22', 'transparent']`.
Row layout `px-4 py-5 gap-3`:
- Left column (76px): avatar 54px with 1.5px tier-colored ring + glow; username 12px bold `#1E1A3E`; **TierBadge** below.
- Middle: kicker **"Global Placement"** — 9px, 700, letterSpacing 1.6, uppercase, muted silver `#7F7D9C`; then **"#12 out of 4,300 users"** — 14px, 700, `#1E1A3E`.
- Right column (108px, right-aligned): **"LVL 18"** — 14px (`text-sm`) 900 uppercase tracking-widest, `#1E1A3E` with tier-glow text-shadow (radius 12). Under it the **XP progress track**: height 6, full-width, `borderRadius: 999`, border 1px `rgba(119,93,216,0.14)`, track `rgba(119,93,216,0.12)`, fill = LinearGradient `[tierPrimary, '#775DD8', '#6366F1']` horizontal with purple glow. Then **"1,240 XP to next level"** — 9px 600 uppercase letterSpacing 1 muted.
- Signed-out state: **"Sign in to compete globally"** (16px, 700, letterSpacing 2, uppercase) + *"Your rank and XP progress will appear here once your profile syncs."* Loading: **"Loading your rank…"**.

### Tier badges (`TierBadge` + `tierTheme.ts`)
Pill label **"TIER C"** etc. — compact: 9px, 900, uppercase, `tracking-[0.14em]`, `px-2 py-[3px]`, `borderRadius: 999`, 1px border, glow shadow (tier color, opacity 0.55, radius 10). Tiers by level: D (1–10) purple `#775DD8`, C (11–25) indigo `#6366F1` (capsule bg `rgba(99,102,241,0.16)`, border `rgba(99,102,241,0.45)`, text highlight `#E0E7FF`), B (26–45) blue `#60A5FA`, A (46–70) fuchsia `#E879F9`, S (71–95) purple `#775DD8`, SS (96+) gold with `LinearGradient ['#FFD700','#F59E0B','#FFD700']` background and text `#FFF7CC`.

### Section title + rows
**"Top Players"** — 14px, 900, letterSpacing 1.6, uppercase, `#1E1A3E`, `marginTop: 16, marginBottom: 8`; list rows gap 8.

Each `LeaderboardRow`: `rounded-2xl` glass card (same tier-tinted treatment), row `px-3.5 py-3.5 gap-2.5`:
- Rank slot (34px): positions 1–3 get a medal chip — height 28, min-width 28, rounded-full, 1px border in medal color, bg medal color at 18 alpha, strong glow (opacity 0.9, radius 12); colors gold `#FFD700`, silver `#C0C0C0`, bronze `#CD7F32`; number 12px 900. Others: plain number 14px 700 in tier secondary color.
- Avatar 40px with tier ring.
- Name 14px 700 `#1E1A3E`; beneath: level capsule **"LVL 18"** (rounded-full `px-2 py-0.5`, tier capsule bg/border, text 10px 700 uppercase in tier `highlight`) + compact **"TIER C"** badge.
- Right: XP number 14px 900 `#1E1A3E` (gold tier renders it in `#FFD700`), with **"XP"** underneath — 9px 700 uppercase tracking-widest in tier secondary. XP formatted with commas (`12,480`).
- Empty state: **"No ranked players yet. Complete tasks and workouts to earn XP."**

## 8. Productivity tab (if you want that variant)
- **"Focus Heatmap"** card (GlassPanel radius 24, `p-5`): kicker 10px 700 uppercase tracking-widest `#7F7D9C`; subtitle **"7 days · 12 focus blocks per day"** 12px; grid of 18×18 cells, gap 4, radius 4 (peak cells `#775DD8` with 1px `rgba(196,132,252,0.8)` border); time axis **"6a 9a 12p 3p 6p 9p"** 8px; legend **"Low" / "Moderate" / "Peak Focus"**.
- **"Planner Task Completion"** card: subtitle **"Weekly completion rate (%)"**; SVG 320×160 line chart, gridlines at 0/25/50/75/100, polyline `#775DD8` strokeWidth 2.5, dots r=4 `#775DD8` with 1.5px ink stroke, day labels 9px.

---

**Recreation notes / gotchas:** two elements retain dark-theme values in this light UI — the donut chart's center hole is `#07070A` (near black) and the Smart Tips card gradient ends at `rgba(7,7,10,0.95)`, so it renders as a dark card. Money uses space thousand separators with `−` (minus sign U+2212), and all kicker labels across both screens are 9–11px, weight 700, uppercase with 1.6–2.8px letter-spacing.