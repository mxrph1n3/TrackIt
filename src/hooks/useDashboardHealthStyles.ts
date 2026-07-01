import { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { BRAND, RADIUS, SEMANTIC } from '../theme/designTokens';
import { getThemedSurfaces } from '../theme/themedSurfaces';
import { useTheme } from '../theme/ThemeContext';

export function useDashboardHealthStyles() {
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
          backgroundColor: 'transparent',
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
          overflow: 'hidden',
        },
        imageHalf: {
          width: '100%',
          overflow: 'hidden',
        },
        imageHalfPlain: {
          borderTopWidth: 1,
        },
        imageHalfArt: {
          width: '100%',
          height: '100%',
        },
        imageHalfContent: {
          flex: 1,
          paddingHorizontal: 20,
          paddingVertical: 16,
          justifyContent: 'center',
        },
        imageHalfContentDense: {
          justifyContent: 'flex-start',
          paddingVertical: 14,
        },
        headerIconShell: {
          width: 38,
          height: 38,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${BRAND.primary}12`,
          borderWidth: 1,
          borderColor: `${BRAND.primary}20`,
        },
        headerTitle: {
          fontSize: 14,
          fontWeight: '800',
          color: theme.textPrimary,
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
        activeKicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.1,
          textTransform: 'uppercase',
          color: theme.primaryNeon,
        },
        workoutTitle: {
          fontSize: 18,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: -0.4,
        },
        workoutMeta: {
          marginTop: 4,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        timerValue: {
          marginTop: 6,
          fontSize: 22,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: 0.5,
        },
        ringLabel: {
          position: 'absolute',
          fontSize: 11,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        completedTitle: {
          fontSize: 15,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        completedMeta: {
          marginTop: 6,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        primaryButton: {
          borderRadius: 14,
          paddingVertical: 13,
          backgroundColor: BRAND.primary,
        },
        primaryButtonText: {
          fontSize: 14,
          fontWeight: '800',
          color: surfaces.onPrimary,
        },
        footerMeta: {
          marginTop: 8,
          fontSize: 11,
          fontWeight: '600',
          color: theme.textMuted,
          textAlign: 'center',
        },
        nutritionPanel: {
          paddingHorizontal: 18,
          paddingTop: 16,
          paddingBottom: 18,
          borderTopWidth: 1,
        },
        nutritionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        },
        nutritionHeaderLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        nutritionIconShell: {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${BRAND.primary}12`,
          borderWidth: 1,
          borderColor: `${BRAND.primary}20`,
        },
        nutritionTitle: {
          fontSize: 14,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        nutritionSubtitle: {
          marginTop: 1,
          fontSize: 11,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        calorieHero: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        },
        calorieHeroText: {
          flex: 1,
        },
        goalBadgeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
        },
        goalBadgeText: {
          fontSize: 11,
          fontWeight: '800',
          color: SEMANTIC.income,
        },
        calorieHeroValue: {
          fontSize: 30,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: -1,
          lineHeight: 32,
        },
        calorieHeroTarget: {
          marginTop: 2,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        macroRow: {
          flexDirection: 'row',
          gap: 8,
          marginTop: 14,
        },
        macroChip: {
          flex: 1,
          borderRadius: 14,
          paddingHorizontal: 10,
          paddingVertical: 10,
          backgroundColor: surfaces.chip,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        macroChipLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.8,
          color: theme.textMuted,
        },
        macroChipValue: {
          marginTop: 2,
          fontSize: 14,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        macroChipTrack: {
          marginTop: 8,
          height: 4,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: surfaces.divider,
        },
        macroChipFill: {
          height: '100%',
          borderRadius: 999,
        },
        waterCard: {
          marginTop: 12,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: surfaces.chip,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        waterTopRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        waterLabelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        waterTrack: {
          height: 6,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: surfaces.divider,
        },
        waterFill: {
          height: '100%',
          borderRadius: 999,
          backgroundColor: '#38BDF8',
        },
        mealSlotRow: {
          flexDirection: 'row',
          gap: 6,
          marginTop: 12,
        },
        mealSlot: {
          flex: 1,
          alignItems: 'center',
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderWidth: 1,
        },
        mealSlotLogged: {
          backgroundColor: 'rgba(52, 211, 153, 0.12)',
          borderColor: 'rgba(52, 211, 153, 0.28)',
        },
        mealSlotPending: {
          backgroundColor: surfaces.empty,
          borderColor: theme.borderSubtle,
        },
        mealSlotLetter: {
          fontSize: 12,
          fontWeight: '800',
          color: theme.textMuted,
        },
        mealSlotLetterLogged: {
          color: SEMANTIC.income,
        },
        mealSlotName: {
          marginTop: 2,
          fontSize: 9,
          fontWeight: '700',
          color: theme.textSecondary,
          textAlign: 'center',
        },
        progressTrack: {
          marginTop: 10,
          height: 6,
          borderRadius: 999,
          overflow: 'hidden',
          backgroundColor: surfaces.divider,
        },
        progressFill: {
          height: '100%',
          borderRadius: 999,
        },
        waterText: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        glassButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: `${BRAND.primary}12`,
          borderWidth: 1,
          borderColor: `${BRAND.primary}28`,
        },
        glassButtonText: {
          fontSize: 11,
          fontWeight: '800',
          color: theme.primaryNeon,
        },
        addMealButton: {
          marginTop: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          borderRadius: 14,
          paddingVertical: 12,
          backgroundColor: surfaces.chip,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        addMealText: {
          fontSize: 13,
          fontWeight: '800',
          color: theme.primaryNeon,
        },
      }),
    [isDark, surfaces, theme],
  );

  return { styles, theme, isDark };
}

export type DashboardHealthStyles = ReturnType<typeof useDashboardHealthStyles>['styles'];
