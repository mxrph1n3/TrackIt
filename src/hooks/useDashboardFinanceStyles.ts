import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { BRAND, RADIUS, SEMANTIC } from '../theme/designTokens';
import { getThemedSurfaces } from '../theme/themedSurfaces';
import { useTheme } from '../theme/ThemeContext';

export function useDashboardFinanceStyles() {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardShell: {
          marginBottom: 14,
          borderRadius: RADIUS.card,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.cardFrosted,
          ...Platform.select({
            ios: {
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: theme.shadowOpacity,
              shadowRadius: theme.shadowRadius,
            },
            android: { elevation: 3 },
          }),
        },
        cardInner: {
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 14,
        },
        headerIconShell: {
          width: 34,
          height: 34,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${BRAND.primary}14`,
          borderWidth: 1,
          borderColor: `${BRAND.primary}22`,
        },
        headerTitle: {
          fontSize: 13,
          fontWeight: '800',
          color: theme.textPrimary,
          letterSpacing: 0.2,
        },
        headerSubtitle: {
          marginTop: 1,
          fontSize: 11,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        openButton: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surfaces.openButton,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        balanceBlock: {
          marginTop: 12,
          marginBottom: 10,
        },
        balanceValue: {
          color: theme.textPrimary,
          fontSize: 32,
          fontWeight: '900',
          letterSpacing: -1.2,
          lineHeight: 34,
        },
        balanceCaption: {
          marginTop: 4,
          fontSize: 11,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        balanceChip: {
          fontSize: 10,
          fontWeight: '700',
          color: theme.textSecondary,
          backgroundColor: `${BRAND.primary}10`,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          overflow: 'hidden',
        },
        trendText: {
          fontSize: 11,
          fontWeight: '700',
        },
        divider: {
          height: 1,
          backgroundColor: surfaces.divider,
          marginVertical: 10,
        },
        miniCard: {
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: surfaces.chip,
          borderWidth: 1,
        },
        miniCardLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        miniCardValue: {
          fontSize: 16,
          fontWeight: '900',
          letterSpacing: -0.4,
        },
        sectionKicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        progressTrack: {
          marginTop: 8,
          height: 6,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: surfaces.progressTrack,
        },
        progressFill: {
          height: '100%',
          borderRadius: 999,
        },
        goalCard: {
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: surfaces.chip,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        goalCompleteCard: {
          backgroundColor: 'rgba(52, 211, 153, 0.12)',
          borderColor: 'rgba(52, 211, 153, 0.28)',
        },
        goalCompleteTitle: {
          fontSize: 12,
          fontWeight: '800',
          color: SEMANTIC.income,
        },
        goalName: {
          fontSize: 14,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        goalAmounts: {
          marginTop: 4,
          fontSize: 11,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        goalCreateButton: {
          borderRadius: 14,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: surfaces.dashedBorder,
          backgroundColor: surfaces.empty,
          paddingVertical: 11,
          alignItems: 'center',
        },
        goalCreateText: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.primaryNeon,
        },
        goalCreateLink: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.primaryNeon,
        },
        lastTxSection: {
          paddingBottom: 2,
        },
        lastTxLabel: {
          fontSize: 14,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        lastTxRelative: {
          marginTop: 1,
          fontSize: 10,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        lastTxAmount: {
          fontSize: 14,
          fontWeight: '900',
          letterSpacing: -0.3,
        },
        actionRow: {
          flexDirection: 'row',
          gap: 8,
          marginTop: 12,
        },
        actionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderRadius: 14,
          paddingVertical: 12,
          borderWidth: 1,
        },
        actionIncome: {
          backgroundColor: 'rgba(5, 150, 105, 0.08)',
          borderColor: 'rgba(5, 150, 105, 0.2)',
        },
        actionExpense: {
          backgroundColor: `${BRAND.primary}10`,
          borderColor: `${BRAND.primary}28`,
        },
        actionLabel: {
          fontSize: 13,
          fontWeight: '800',
        },
        emptyBody: {
          marginTop: 14,
          borderRadius: 18,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: surfaces.dashedBorder,
          backgroundColor: surfaces.empty,
          paddingHorizontal: 16,
          paddingVertical: 18,
          alignItems: 'center',
        },
        emptyTitle: {
          fontSize: 16,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        emptySubtitle: {
          marginTop: 6,
          fontSize: 13,
          lineHeight: 18,
          textAlign: 'center',
          color: theme.textSecondary,
        },
        primaryCta: {
          width: '100%',
          borderRadius: 14,
          paddingVertical: 13,
          alignItems: 'center',
          backgroundColor: BRAND.primary,
        },
        primaryCtaText: {
          fontSize: 14,
          fontWeight: '800',
          color: surfaces.onPrimary,
        },
        metaPercent: {
          fontSize: 11,
          fontWeight: '800',
          color: theme.textPrimary,
        },
      }),
    [isDark, surfaces, theme],
  );

  return { styles, theme, isDark, blurTint: theme.blurTint };
}
