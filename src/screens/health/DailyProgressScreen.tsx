import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { HealthProgressBar } from '../../components/health/ui/HealthProgressBar';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { PremiumCard } from '../../components/health/ui/PremiumCard';
import { useAnalyticsHealth } from '../../hooks/useAnalyticsHealth';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { useTodayNutrition } from '../../hooks/useTodayNutrition';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import { useHealthStore } from '../../stores/useHealthStore';

export function DailyProgressScreen() {
  const { t } = useTranslation();
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const { pop } = useHealthNavigation();
  const { dietPlan, consumedMacros: consumed } = useTodayNutrition();
  const bodyStats = useHealthStore((s) => s.bodyStats);
  const { data, isLoading } = useAnalyticsHealth();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((ht) => ({
    root: { flex: 1, backgroundColor: ht.background },
    content: { paddingHorizontal: 20 },
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
      marginBottom: 14,
    },
    spacer: { height: 16 },
    loading: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    trendValue: {
      fontSize: 24,
      fontWeight: '900',
      color: ht.ink,
      marginBottom: 16,
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 100,
      gap: 6,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
    },
    bar: {
      width: '100%',
      maxWidth: 28,
      backgroundColor: ht.accent,
      borderRadius: 6,
      minHeight: 8,
    },
    barLabel: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '600',
      color: ht.slate,
    },
    goalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: ht.ink,
      marginBottom: 8,
    },
    goalBody: {
      fontSize: 14,
      lineHeight: 21,
      color: ht.slate,
      fontWeight: '500',
    },
  }));

  const caloriePercent = Math.min(100, Math.round((consumed.calories / dietPlan.calories) * 100));
  const weeklyAvg = data.avgCalories;
  const chartMax = Math.max(dietPlan.calories, ...data.series.map((day) => day.calories), 1);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollContentPaddingBottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <HealthScreenHeader
          title={t('nutrition.dailyProgress')}
          subtitle={t('nutrition.analyticsGoals')}
          onBack={pop}
        />

        <PremiumCard>
          <Text style={styles.kicker}>{t('nutrition.today')}</Text>
          <HealthProgressBar
            label={t('common.calories')}
            meta={`${consumed.calories} / ${dietPlan.calories}`}
            progress={caloriePercent}
          />
          <View style={styles.spacer} />
          <HealthProgressBar
            label={t('common.protein')}
            meta={`${Math.round(consumed.protein)} / ${dietPlan.protein_target}g`}
            progress={Math.min(100, (consumed.protein / dietPlan.protein_target) * 100)}
            color={healthTheme.macro.protein}
          />
          <View style={styles.spacer} />
          <HealthProgressBar
            label={t('common.fat')}
            meta={`${Math.round(consumed.fat)} / ${dietPlan.fat_target}g`}
            progress={Math.min(100, (consumed.fat / dietPlan.fat_target) * 100)}
            color={healthTheme.macro.fat}
          />
          <View style={styles.spacer} />
          <HealthProgressBar
            label={t('common.carbs')}
            meta={`${Math.round(consumed.carbs)} / ${dietPlan.carb_target}g`}
            progress={Math.min(100, (consumed.carbs / dietPlan.carb_target) * 100)}
            color={healthTheme.macro.carbs}
          />
        </PremiumCard>

        <PremiumCard>
          <Text style={styles.kicker}>{t('nutrition.weeklyTrend')}</Text>
          {isLoading && !data.isLive ? (
            <View style={styles.loading}>
              <ActivityIndicator color={healthTheme.accent} size="small" />
            </View>
          ) : (
            <>
              <Text style={styles.trendValue}>
                {weeklyAvg > 0
                  ? `${weeklyAvg.toLocaleString()} ${t('common.kcal')} / day avg`
                  : t('nutrition.emptyWeek')}
              </Text>
              <View style={styles.chart}>
                {data.series.map((day) => {
                  const h = Math.min(80, (day.calories / chartMax) * 80);
                  return (
                    <View key={day.day} style={styles.barCol}>
                      <View style={[styles.bar, { height: Math.max(8, h) }]} />
                      <Text style={styles.barLabel}>{day.day}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </PremiumCard>

        <PremiumCard>
          <Text style={styles.kicker}>{t('nutrition.body')}</Text>
          <Text style={styles.trendValue}>
            {bodyStats.weightKg.toFixed(1)} {t('common.kg')}
          </Text>
          <Text style={styles.goalBody}>
            {data.hasWeightData && data.weightDelta != null
              ? `Weekly change: ${data.weightDelta > 0 ? '+' : ''}${data.weightDelta} ${t('common.kg')}`
              : t('nutrition.emptyWeight')}
          </Text>
        </PremiumCard>

        <PremiumCard>
          <Text style={styles.kicker}>{t('nutrition.goal')}</Text>
          <Text style={styles.goalTitle}>{dietPlan.label}</Text>
          <Text style={styles.goalBody}>
            Stay within {dietPlan.calories} kcal with balanced macros for sustainable progress.
          </Text>
        </PremiumCard>
      </ScrollView>
    </View>
  );
}
