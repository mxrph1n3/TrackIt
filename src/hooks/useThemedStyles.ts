import { useMemo } from 'react';
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { BRAND } from '../theme/designTokens';
import { getThemedSurfaces } from '../theme/themedSurfaces';
import { useTheme } from '../theme/ThemeContext';

/** Shared text + surface styles for screens still migrating off static designTokens. */
export function useThemedStyles() {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  const text = useMemo(
    () =>
      StyleSheet.create({
        primary: { color: theme.textPrimary } satisfies TextStyle,
        secondary: { color: theme.textSecondary } satisfies TextStyle,
        muted: { color: theme.textMuted } satisfies TextStyle,
        onBrand: { color: surfaces.onPrimary } satisfies TextStyle,
        link: { color: isDark ? theme.primaryNeon : BRAND.primaryDeep } satisfies TextStyle,
      }),
    [isDark, surfaces.onPrimary, theme],
  );

  const surfaces_styles = useMemo(
    () =>
      StyleSheet.create({
        chip: { backgroundColor: surfaces.chip } satisfies ViewStyle,
        inset: { backgroundColor: surfaces.inset, borderColor: surfaces.border } satisfies ViewStyle,
        empty: { backgroundColor: surfaces.empty } satisfies ViewStyle,
      }),
    [surfaces],
  );

  return { theme, isDark, surfaces, text, surfaceStyles: surfaces_styles };
}
