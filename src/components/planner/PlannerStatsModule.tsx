import { BarChart3, Flame, Sparkles } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { useProgression } from '../../hooks/useProgression';
import { useHealthStore } from '../../stores/useHealthStore';
import { navigateTab } from '../../navigation/navigationRef';
import { BRAND } from '../../theme/designTokens';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PLANNER_COPY } from './plannerTheme';

export function PlannerStatsModule() {
  const { styles: plannerStyles, theme, surfaces, isDark } = usePlannerTheme();
  const { level, xpProgress, profileStats } = useProgression();
  const streakDays = useHealthStore((s) => s.lifetimeStats.streakDays);
  const totalWorkouts = useHealthStore((s) => s.lifetimeStats.totalWorkouts);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        grid: {
          flexDirection: 'row',
          gap: 10,
        },
        tile: {
          flex: 1,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: surfaces.border,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 10,
          paddingVertical: 12,
          gap: 6,
        },
        tileLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        tileValue: {
          fontSize: 15,
          fontWeight: '900',
          color: theme.textPrimary,
        },
        progressTrack: {
          marginTop: 14,
          height: 8,
          borderRadius: 999,
          backgroundColor: surfaces.progressTrack,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          borderRadius: 999,
          backgroundColor: BRAND.primaryLight,
        },
        progressCaption: {
          marginTop: 8,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
          lineHeight: 18,
        },
      }),
    [isDark, surfaces, theme],
  );

  return (
    <Pressable onPress={() => navigateTab('Analytics')}>
      <PlannerPremiumCard>
        <View style={plannerStyles.moduleInner}>
          <PlannerSectionHeader
            title={PLANNER_COPY.stats}
            subtitle={`Level ${level} · ${profileStats.username}`}
            actionLabel={PLANNER_COPY.open}
            onAction={() => navigateTab('Analytics')}
          />

          <View style={styles.grid}>
            <StatTile
              icon={<Sparkles color={BRAND.primary} size={16} />}
              label="XP"
              value={`${xpProgress.currentXp} / ${xpProgress.requiredXp}`}
              styles={styles}
            />
            <StatTile
              icon={<Flame color={BRAND.primaryLight} size={16} />}
              label="Streak"
              value={`${streakDays} days`}
              styles={styles}
            />
            <StatTile
              icon={<BarChart3 color={BRAND.accent} size={16} />}
              label="Workouts"
              value={String(totalWorkouts)}
              styles={styles}
            />
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${xpProgress.percent}%` }]} />
          </View>
          <Text style={styles.progressCaption}>
            Progress to level {level + 1} · heatmaps and charts in Analytics
          </Text>
        </View>
      </PlannerPremiumCard>
    </Pressable>
  );
}

function StatTile({
  icon,
  label,
  value,
  styles,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={styles.tile}>
      {icon}
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}
