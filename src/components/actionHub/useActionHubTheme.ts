import { useMemo } from 'react';
import { Platform } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { ACTION_HUB } from './actionHubTheme';

export function useActionHubTheme() {
  const { theme, isDark } = useTheme();

  return useMemo(
    () => ({
      ...ACTION_HUB,
      isDark,
      blurTint: theme.blurTint,
      ink: isDark ? theme.textPrimary : ACTION_HUB.crystalInk,
      subtitle: isDark ? theme.textSecondary : '#8E89B3',
      glassBorder: isDark ? 'rgba(149, 128, 232, 0.45)' : ACTION_HUB.glassBorder,
      glassEdge: isDark ? 'rgba(149, 128, 232, 0.28)' : ACTION_HUB.glassEdge,
      panelBg: isDark
        ? Platform.OS === 'ios'
          ? 'rgba(22, 18, 38, 0.72)'
          : 'rgba(18, 18, 30, 0.94)'
        : Platform.OS === 'ios'
          ? 'rgba(255,255,255,0.55)'
          : 'rgba(255,255,255,0.92)',
      cardBg: isDark
        ? Platform.OS === 'ios'
          ? 'rgba(22, 18, 38, 0.78)'
          : 'rgba(18, 18, 30, 0.96)'
        : Platform.OS === 'ios'
          ? 'rgba(255,255,255,0.78)'
          : '#FFFFFF',
      orbBg: isDark
        ? Platform.OS === 'ios'
          ? 'rgba(28, 24, 44, 0.88)'
          : 'rgba(18, 18, 30, 0.96)'
        : Platform.OS === 'ios'
          ? 'rgba(255,255,255,0.72)'
          : '#FFFFFF',
      crystalBg: isDark
        ? Platform.OS === 'ios'
          ? 'rgba(22, 18, 38, 0.42)'
          : 'rgba(18, 18, 30, 0.94)'
        : Platform.OS === 'ios'
          ? 'rgba(255,255,255,0.42)'
          : 'rgba(255,255,255,0.94)',
      crystalGradient: isDark
        ? (['#2A2540', '#1E1A32', '#16122A'] as const)
        : (['#FFFFFF', '#F8F7FF', '#F3F1FF'] as const),
      crystalInnerBorder: isDark ? 'rgba(149, 128, 232, 0.4)' : 'rgba(255, 255, 255, 0.85)',
      lineStroke: isDark ? 'rgba(149, 128, 232, 0.28)' : 'rgba(124, 92, 252, 0.14)',
      rowDivider: isDark ? 'rgba(149, 128, 232, 0.22)' : 'rgba(119, 93, 216, 0.1)',
      shadowOpacity: isDark ? 0.24 : 0.08,
      sectionLabel: isDark ? theme.textMuted : '#8E89B3',
      placeholder: isDark ? theme.textMuted : '#8E89B3',
      scrim: isDark ? 'rgba(0, 0, 0, 0.82)' : ACTION_HUB.scrim,
    }),
    [isDark, theme],
  );
}

export type ActionHubThemeTokens = ReturnType<typeof useActionHubTheme>;
