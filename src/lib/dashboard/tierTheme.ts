import type { ViewStyle } from 'react-native';

export type DashboardTierTheme = {
  code: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
  label: string;
  primary: string;
  secondary: string;
  highlight: string;
  glow: string;
  sheen: string;
  capsuleBackground: string;
  capsuleBorder: string;
  useGoldGradient: boolean;
};

const TIER_THEMES: Record<DashboardTierTheme['code'], DashboardTierTheme> = {
  D: {
    code: 'D',
    label: 'TIER D',
    primary: '#775DD8',
    secondary: '#6366F1',
    highlight: '#EDE9FE',
    glow: 'rgba(119, 93, 216, 0.35)',
    sheen: 'rgba(237, 233, 254, 0.85)',
    capsuleBackground: 'rgba(119, 93, 216, 0.12)',
    capsuleBorder: 'rgba(119, 93, 216, 0.35)',
    useGoldGradient: false,
  },
  C: {
    code: 'C',
    label: 'TIER C',
    primary: '#6366F1',
    secondary: '#4F46E5',
    highlight: '#E0E7FF',
    glow: 'rgba(99, 102, 241, 0.85)',
    sheen: 'rgba(224, 231, 255, 0.5)',
    capsuleBackground: 'rgba(99, 102, 241, 0.16)',
    capsuleBorder: 'rgba(99, 102, 241, 0.45)',
    useGoldGradient: false,
  },
  B: {
    code: 'B',
    label: 'TIER B',
    primary: '#60A5FA',
    secondary: '#3B82F6',
    highlight: '#DBEAFE',
    glow: 'rgba(96, 165, 250, 0.85)',
    sheen: 'rgba(219, 234, 254, 0.5)',
    capsuleBackground: 'rgba(96, 165, 250, 0.14)',
    capsuleBorder: 'rgba(96, 165, 250, 0.42)',
    useGoldGradient: false,
  },
  A: {
    code: 'A',
    label: 'TIER A',
    primary: '#E879F9',
    secondary: '#D946EF',
    highlight: '#FAE8FF',
    glow: 'rgba(217, 70, 239, 0.85)',
    sheen: 'rgba(250, 232, 255, 0.55)',
    capsuleBackground: 'rgba(217, 70, 239, 0.16)',
    capsuleBorder: 'rgba(217, 70, 239, 0.45)',
    useGoldGradient: false,
  },
  S: {
    code: 'S',
    label: 'TIER S',
    primary: '#775DD8',
    secondary: '#9333EA',
    highlight: '#F3E8FF',
    glow: 'rgba(119, 93, 216, 0.35)',
    sheen: 'rgba(243, 232, 255, 0.6)',
    capsuleBackground: 'rgba(119, 93, 216, 0.18)',
    capsuleBorder: 'rgba(119, 93, 216, 0.5)',
    useGoldGradient: false,
  },
  SS: {
    code: 'SS',
    label: 'TIER SS',
    primary: '#FFD700',
    secondary: '#F59E0B',
    highlight: '#FFF7CC',
    glow: 'rgba(255, 215, 0, 0.95)',
    sheen: 'rgba(255, 247, 204, 0.75)',
    capsuleBackground: 'rgba(255, 215, 0, 0.16)',
    capsuleBorder: 'rgba(255, 215, 0, 0.55)',
    useGoldGradient: true,
  },
};

export function getDashboardTierTheme(level: number): DashboardTierTheme {
  if (level >= 96) return TIER_THEMES.SS;
  if (level >= 71) return TIER_THEMES.S;
  if (level >= 46) return TIER_THEMES.A;
  if (level >= 26) return TIER_THEMES.B;
  if (level >= 11) return TIER_THEMES.C;
  return TIER_THEMES.D;
}

export function tierCapsuleShadow(theme: DashboardTierTheme): ViewStyle {
  return {
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
  };
}
