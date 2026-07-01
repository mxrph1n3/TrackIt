import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { BRAND, RADIUS } from '../theme/designTokens';
import { getThemedSurfaces } from '../theme/themedSurfaces';
import { useTheme } from '../theme/ThemeContext';

export function usePlannerTheme() {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screenRoot: {
          flex: 1,
          backgroundColor: 'transparent',
        },
        moduleInner: {
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 16,
        },
        sectionTitle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2.4,
          textTransform: 'uppercase',
          color: theme.textPrimary,
        },
        sectionSubtitle: {
          marginTop: 4,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
        },
        meta: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.textSecondary,
          lineHeight: 20,
        },
        body: {
          fontSize: 15,
          fontWeight: '500',
          color: theme.textPrimary,
          lineHeight: 24,
        },
        bodyMuted: {
          fontSize: 14,
          fontWeight: '500',
          color: theme.textMuted,
          lineHeight: 22,
        },
        actionLink: {
          fontSize: 12,
          fontWeight: '700',
          color: isDark ? theme.primaryNeon : BRAND.primaryDeep,
        },
        insetPanel: {
          borderRadius: RADIUS.inset,
          borderWidth: 1,
          borderColor: surfaces.border,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 14,
          paddingVertical: 12,
        },
        metricValue: {
          fontSize: 22,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: -0.5,
        },
        metricLabel: {
          marginTop: 2,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
      }),
    [isDark, surfaces.border, surfaces.inset, theme],
  );

  return { theme, isDark, styles, surfaces, panel: surfaces.inset, panelBorder: surfaces.border };
}
