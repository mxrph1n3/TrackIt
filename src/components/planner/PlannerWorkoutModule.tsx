import { ChevronRight, Dumbbell, Play } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { useTodayWorkoutPreview } from '../../stores/useHealthStore';
import { navigateTab } from '../../navigation/navigationRef';
import { BRAND, SEMANTIC } from '../../theme/designTokens';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PLANNER_COPY } from './plannerTheme';

export function PlannerWorkoutModule() {
  const { styles: plannerStyles, theme, surfaces, isDark } = usePlannerTheme();
  const { focusName, exerciseCount, estimatedMinutes, programTitle } = useTodayWorkoutPreview();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hero: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: surfaces.border,
          backgroundColor: surfaces.inset,
          padding: 14,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? 'rgba(119, 93, 216, 0.22)' : 'rgba(119, 93, 216, 0.1)',
        },
        copy: {
          flex: 1,
        },
        focusName: {
          fontSize: 16,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        playChip: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.primary,
        },
        footer: {
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        },
        footerHint: {
          flex: 1,
          fontSize: 12,
          fontWeight: '600',
          color: SEMANTIC.success,
        },
      }),
    [isDark, surfaces, theme],
  );

  return (
    <Pressable onPress={() => navigateTab('Health')}>
      <PlannerPremiumCard>
        <View style={plannerStyles.moduleInner}>
          <PlannerSectionHeader
            title={PLANNER_COPY.workouts}
            subtitle={`${programTitle} · ~${estimatedMinutes} min`}
            actionLabel={PLANNER_COPY.open}
            onAction={() => navigateTab('Health')}
          />

          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Dumbbell color={BRAND.primary} size={20} strokeWidth={2} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.focusName} numberOfLines={1}>
                {focusName}
              </Text>
              <Text style={plannerStyles.meta}>
                {exerciseCount} exercises · sets, reps & PRs in Health
              </Text>
            </View>
            <View style={styles.playChip}>
              <Play color="#FFFFFF" size={14} fill="#FFFFFF" />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerHint}>Open Health for the full workout card</Text>
            <ChevronRight color={theme.textMuted} size={18} />
          </View>
        </View>
      </PlannerPremiumCard>
    </Pressable>
  );
}
