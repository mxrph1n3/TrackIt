import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AnalyticsFreeTierBanner } from '../AnalyticsFreeTierBanner';
import { useAnalyticsOverview } from '../../../hooks/useAnalyticsOverview';
import { SPACING } from '../../../theme/designTokens';
import { useTheme } from '../../../theme/ThemeContext';
import { HabitCompletionHeatmap } from './HabitCompletionHeatmap';
import { LeaderboardOverviewSection } from '../LeaderboardOverviewSection';
import { OverallGrowthCard } from './OverallGrowthCard';
import { STATISTICS_BAR_ACCENTS, StatisticsBarChartCard } from './StatisticsBarChartCard';

export function StatisticsOverviewPanel() {
  const { t } = useTranslation();
  const { data, isLoading } = useAnalyticsOverview();
  const { theme } = useTheme();

  if (isLoading && !data.isLive) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={theme.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <AnalyticsFreeTierBanner />
      <OverallGrowthCard
        percent={data.overallGrowth.percent}
        rangeLabel={data.overallGrowth.rangeLabel}
        series={data.overallGrowth.series}
      />
      <HabitCompletionHeatmap
        rangeLabel={data.habitHeatmap.rangeLabel}
        weekLabels={data.habitHeatmap.weekLabels}
        rows={data.habitHeatmap.rows}
      />

      <View style={styles.row}>
        <StatisticsBarChartCard
          flex={1}
          title={t('analytics.charts.workouts')}
          subtitle={t('analytics.charts.workoutsSub')}
          data={data.workoutSessions}
          accent={STATISTICS_BAR_ACCENTS.workout}
          valueFormatter={(v) => `${v} min`}
        />
        <View style={styles.gap} />
        <StatisticsBarChartCard
          flex={1}
          title={t('analytics.charts.nutrition')}
          subtitle={t('analytics.charts.nutritionSub')}
          data={data.nutritionCalories}
          accent={STATISTICS_BAR_ACCENTS.nutrition}
          valueFormatter={(v) => `${v} ${t('common.kcal')}`}
        />
      </View>

      <View style={styles.row}>
        <StatisticsBarChartCard
          flex={1}
          title={t('analytics.charts.financeExpenses')}
          subtitle={t('analytics.charts.financeExpensesSub')}
          data={data.financeExpenses}
          accent={STATISTICS_BAR_ACCENTS.expense}
          valueFormatter={(v) => `$${v}`}
        />
        <View style={styles.gap} />
        <StatisticsBarChartCard
          flex={1}
          title={t('analytics.charts.financeIncome')}
          subtitle={t('analytics.charts.financeIncomeSub')}
          data={data.financeIncome}
          accent={STATISTICS_BAR_ACCENTS.income}
          valueFormatter={(v) => `$${v}`}
        />
      </View>

      <LeaderboardOverviewSection />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
    paddingBottom: SPACING.cardGap,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  gap: {
    width: 10,
  },
});
