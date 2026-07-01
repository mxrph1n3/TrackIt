/** Premium health module visual tokens — bright luxury aesthetic. */
export const HEALTH_THEME = {
  background: '#F7F8FC',
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

export const OBSIDIAN_HEALTH_THEME = {
  background: '#07070A',
  card: 'rgba(15, 15, 25, 0.92)',
  cardBorder: 'rgba(119, 93, 216, 0.22)',
  accent: '#9580E8',
  accentSoft: 'rgba(119, 93, 216, 0.18)',
  accentMuted: 'rgba(149, 128, 232, 0.45)',
  ink: '#F8FAFC',
  slate: 'rgba(255, 255, 255, 0.68)',
  muted: 'rgba(255, 255, 255, 0.45)',
  shadow: 'rgba(119, 93, 216, 0.24)',
  radius: HEALTH_THEME.radius,
  macro: HEALTH_THEME.macro,
} as const;

export type HealthThemeTokens = {
  background: string;
  card: string;
  cardBorder: string;
  accent: string;
  accentSoft: string;
  accentMuted: string;
  ink: string;
  slate: string;
  muted: string;
  shadow: string;
  radius: typeof HEALTH_THEME.radius;
  macro: typeof HEALTH_THEME.macro;
};

export function getHealthTheme(isDark: boolean): HealthThemeTokens {
  return isDark ? OBSIDIAN_HEALTH_THEME : HEALTH_THEME;
}

export const HEALTH_ELEVATION = {
  card: {
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  button: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;
