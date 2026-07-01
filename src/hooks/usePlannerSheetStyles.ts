import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { BRAND, RADIUS } from '../theme/designTokens';
import { getThemedSurfaces } from '../theme/themedSurfaces';
import { useTheme } from '../theme/ThemeContext';

export function usePlannerSheetStyles() {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.82)' : 'rgba(30, 26, 62, 0.52)',
        },
        sheet: {
          backgroundColor: theme.cardFrosted,
          borderTopLeftRadius: RADIUS.sheet,
          borderTopRightRadius: RADIUS.sheet,
          paddingHorizontal: 20,
          paddingTop: 20,
          borderTopWidth: 1,
          borderColor: theme.border,
        },
        kicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        title: {
          fontSize: 22,
          fontWeight: '800',
          color: theme.textPrimary,
          marginTop: 4,
          marginBottom: 18,
        },
        label: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: theme.textMuted,
          marginBottom: 8,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          borderRadius: 16,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: theme.textPrimary,
          marginBottom: 16,
        },
        chipRow: {
          flexDirection: 'row',
          gap: 8,
          marginBottom: 16,
          paddingRight: 8,
        },
        chip: {
          maxWidth: 180,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.chip,
        },
        chipActive: {
          borderColor: `${BRAND.primary}66`,
          backgroundColor: `${BRAND.primary}18`,
        },
        chipText: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        chipTextActive: {
          color: theme.textPrimary,
        },
        hint: {
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 21,
          color: theme.textSecondary,
        },
        primaryButton: {
          borderRadius: 16,
          backgroundColor: BRAND.primary,
          paddingVertical: 14,
          alignItems: 'center',
          marginTop: 8,
        },
        primaryButtonLabel: {
          fontSize: 15,
          fontWeight: '800',
          color: surfaces.onPrimary,
        },
        secondaryButton: {
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.chip,
          paddingVertical: 14,
          alignItems: 'center',
          marginTop: 10,
        },
        secondaryButtonLabel: {
          fontSize: 15,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        error: {
          color: '#F87171',
          fontSize: 13,
          marginBottom: 12,
        },
        actions: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 4,
        },
        secondaryBtn: {
          flex: 1,
          alignItems: 'center',
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        secondaryLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        primaryBtn: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: BRAND.primary,
          minHeight: 48,
        },
        primaryBtnDisabled: {
          opacity: 0.55,
        },
        primaryLabel: {
          fontSize: 14,
          fontWeight: '700',
          color: surfaces.onPrimary,
        },
      }),
    [isDark, surfaces, theme],
  );

  return { styles, theme, isDark };
}
