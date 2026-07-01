import { BRAND, RADIUS, TEXT } from './designTokens';
import { ETHEREAL_COLORS } from './etherealTokens';

export type AppThemeMode = 'ethereal' | 'obsidian';

export type AppTheme = {
  mode: AppThemeMode;
  background: string;
  backgroundEnd: string;
  lavenderMist: string;
  ambientGlow: string;
  card: string;
  cardFrosted: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryNeon: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  ink: string;
  inkDeep: string;
  glowPurple: string;
  glowIndigo: string;
  blurIntensity: number;
  sheetBlurIntensity: number;
  cardRadius: number;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  ringTrack: string;
  blurTint: 'light' | 'dark';
  statusBarStyle: 'light' | 'dark';
  tabBarBackground: string;
  gridStroke: string;
  axisStroke: string;
  radarFill: string;
  radarStroke: string;
  iconMuted: string;
  iconActive: string;
  drawerBackdrop: string;
  drawerPanel: string;
};

export const ETHEREAL_THEME: AppTheme = {
  mode: 'ethereal',
  background: ETHEREAL_COLORS.background,
  backgroundEnd: '#FFFFFF',
  lavenderMist: ETHEREAL_COLORS.ambientGlowSolid,
  ambientGlow: ETHEREAL_COLORS.ambientGlow,
  card: ETHEREAL_COLORS.glassCard,
  cardFrosted: 'rgba(255, 255, 255, 0.72)',
  border: ETHEREAL_COLORS.glassBorder,
  borderSubtle: 'rgba(119, 93, 216, 0.14)',
  primary: ETHEREAL_COLORS.neonActive,
  primaryNeon: ETHEREAL_COLORS.neonActive,
  secondary: ETHEREAL_COLORS.neonLight,
  textPrimary: ETHEREAL_COLORS.textPrimary,
  textSecondary: ETHEREAL_COLORS.textSecondary,
  textMuted: TEXT.muted,
  ink: ETHEREAL_COLORS.textPrimary,
  inkDeep: ETHEREAL_COLORS.textPrimary,
  glowPurple: ETHEREAL_COLORS.neonGlow,
  glowIndigo: 'rgba(119, 93, 216, 0.2)',
  blurIntensity: 25,
  sheetBlurIntensity: 35,
  cardRadius: RADIUS.card,
  shadowColor: ETHEREAL_COLORS.neonActive,
  shadowOpacity: 0.05,
  shadowRadius: 20,
  ringTrack: 'rgba(119, 93, 216, 0.12)',
  blurTint: 'light',
  statusBarStyle: 'dark',
  tabBarBackground: ETHEREAL_COLORS.glassCard,
  gridStroke: 'rgba(119, 93, 216, 0.1)',
  axisStroke: 'rgba(119, 93, 216, 0.16)',
  radarFill: 'rgba(119, 93, 216, 0.2)',
  radarStroke: ETHEREAL_COLORS.neonActive,
  iconMuted: ETHEREAL_COLORS.textSecondary,
  iconActive: ETHEREAL_COLORS.neonActive,
  drawerBackdrop: 'rgba(30, 26, 62, 0.16)',
  drawerPanel: 'rgba(255, 255, 255, 0.82)',
};

export const OBSIDIAN_DARK_THEME: AppTheme = {
  mode: 'obsidian',
  background: '#07070A',
  backgroundEnd: '#10101A',
  lavenderMist: '#141422',
  ambientGlow: 'rgba(119, 93, 216, 0.18)',
  card: 'rgba(15, 15, 25, 0.88)',
  cardFrosted: 'rgba(18, 18, 30, 0.82)',
  border: 'rgba(119, 93, 216, 0.18)',
  borderSubtle: 'rgba(119, 93, 216, 0.28)',
  primary: ETHEREAL_COLORS.neonActive,
  primaryNeon: ETHEREAL_COLORS.neonActive,
  secondary: '#818CF8',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.72)',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  ink: '#FFFFFF',
  inkDeep: '#F8FAFC',
  glowPurple: ETHEREAL_COLORS.neonGlow,
  glowIndigo: 'rgba(129, 140, 248, 0.35)',
  blurIntensity: 30,
  sheetBlurIntensity: 40,
  cardRadius: RADIUS.card,
  shadowColor: ETHEREAL_COLORS.neonActive,
  shadowOpacity: 0.18,
  shadowRadius: 20,
  ringTrack: 'rgba(119, 93, 216, 0.2)',
  blurTint: 'dark',
  statusBarStyle: 'light',
  tabBarBackground: 'rgba(15, 15, 25, 0.75)',
  gridStroke: 'rgba(255, 255, 255, 0.08)',
  axisStroke: 'rgba(255, 255, 255, 0.12)',
  radarFill: 'rgba(119, 93, 216, 0.28)',
  radarStroke: ETHEREAL_COLORS.neonActive,
  iconMuted: 'rgba(255, 255, 255, 0.45)',
  iconActive: ETHEREAL_COLORS.neonActive,
  drawerBackdrop: 'rgba(0, 0, 0, 0.65)',
  drawerPanel: 'rgba(15, 15, 25, 0.92)',
};

export function getThemeForMode(mode: AppThemeMode): AppTheme {
  return mode === 'obsidian' ? OBSIDIAN_DARK_THEME : ETHEREAL_THEME;
}

export const THEME_STORAGE_KEY = '@trackit/theme_mode';

export { ETHEREAL_COLORS, EtherealTheme } from './etherealTokens';
