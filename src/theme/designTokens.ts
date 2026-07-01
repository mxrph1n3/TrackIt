/**
 * TrackIt design tokens — Phase 1 single source of truth.
 * Import from here or via `etherealTokens` / `themes` / Tailwind `ethereal.*`.
 */

/** Brand purple — one primary family only. */
export const BRAND = {
  primary: '#775DD8',
  primaryLight: '#9580E8',
  primaryDeep: '#6249C0',
  /** Secondary accent for multi-action grids (habits, indigo hints). */
  accent: '#818CF8',
} as const;

/** Semantic colors — finance & status. */
export const SEMANTIC = {
  income: '#059669',
  incomeSoft: '#34D399',
  expense: '#E11D48',
  expenseSoft: '#F87171',
  warning: '#F59E0B',
  success: '#34D399',
} as const;

/** Text on Ethereal (light) surfaces. */
export const TEXT = {
  primary: '#1E1A3E',
  secondary: '#7F7D9C',
  muted: '#8E89B3',
  kicker: '#3D3855',
} as const;

/** Surface & glass. */
export const SURFACE = {
  background: '#F3F5FA',
  card: 'rgba(255, 255, 255, 0.75)',
  cardFrosted: 'rgba(255, 255, 255, 0.72)',
  cardSolid: '#FAFAFC',
  border: 'rgba(255, 255, 255, 0.60)',
  borderSubtle: 'rgba(119, 93, 216, 0.14)',
  ambientGlow: 'rgba(226, 217, 255, 0.3)',
  ambientGlowSolid: '#E2D9FF',
  shadow: 'rgba(119, 93, 216, 0.05)',
  glow: 'rgba(119, 93, 216, 0.35)',
} as const;

/** Border radius scale. */
export const RADIUS = {
  control: 14,
  inset: 20,
  card: 28,
  sheet: 28,
} as const;

/** Layout spacing. */
export const SPACING = {
  screenGutter: 20,
  cardGap: 14,
  sectionGap: 20,
} as const;

/** Typography scale (use with StyleSheet or as reference for Tailwind). */
export const TYPOGRAPHY = {
  kicker: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 2.2,
    textTransform: 'uppercase' as const,
  },
  screenTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 3.5,
    textTransform: 'uppercase' as const,
  },
  hero: {
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: -1.5,
  },
  body: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
} as const;

/** Gradient stops — CTAs, FAB, rings. */
export const GRADIENTS = {
  primary: ['#9580E8', '#775DD8', '#6249C0'] as const,
  primaryShort: ['#9580E8', '#775DD8'] as const,
  fab: ['#9580E8', '#775DD8'] as const,
  ring: ['#775DD8', '#6249C0'] as const,
} as const;

/** Elevation / shadow presets. */
export const ELEVATION = {
  rest: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  raised: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
} as const;
