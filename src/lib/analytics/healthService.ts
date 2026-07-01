import type { HealthTrendPoint } from '../../types/analytics';
import { fetchWeightTrend } from '../health/weightService';
import { buildCurrentWeek } from '../../utils/plannerDates';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export type HealthAnalyticsSnapshot = {
  series: HealthTrendPoint[];
  avgCalories: number;
  weightDelta: number | null;
  hasWeightData: boolean;
  isLive: boolean;
};

function formatDayLabel(label: string): string {
  return label.charAt(0) + label.slice(1, 3).toLowerCase();
}

export function emptyHealth(): HealthAnalyticsSnapshot {
  const week = buildCurrentWeek();
  return {
    series: week.map((day) => ({
      day: formatDayLabel(day.label),
      calories: 0,
      weight: 0,
    })),
    avgCalories: 0,
    weightDelta: null,
    hasWeightData: false,
    isLive: false,
  };
}

export async function fetchHealthAnalytics(userId: string): Promise<HealthAnalyticsSnapshot> {
  if (!isSupabaseConfigured) {
    return emptyHealth();
  }

  const week = buildCurrentWeek();
  const startKey = week[0].key;
  const endKey = week[6].key;

  const [nutritionResult, weightTrend] = await Promise.all([
    supabase
      .from('daily_nutrition_logs')
      .select('log_date, calories_consumed')
      .eq('user_id', userId)
      .gte('log_date', startKey)
      .lte('log_date', endKey),
    fetchWeightTrend(userId, startKey, endKey),
  ]);

  const { data, error } = nutritionResult;

  if (isMissingSchemaError(error)) {
    console.warn('[HealthAnalytics] Schema unavailable — showing zero state.');
    return emptyHealth();
  }

  const rows = error
    ? []
    : ((data ?? []) as Array<{ log_date: string; calories_consumed: number }>);

  const caloriesByDay = new Map<string, number>();
  for (const row of rows) {
    caloriesByDay.set(row.log_date, Math.round(Number(row.calories_consumed ?? 0)));
  }

  const weightByDay = new Map(weightTrend.map((point) => [point.dayKey, point.weightKg]));

  const series: HealthTrendPoint[] = week.map((day) => ({
    day: formatDayLabel(day.label),
    calories: caloriesByDay.get(day.key) ?? 0,
    weight: weightByDay.get(day.key) ?? 0,
  }));

  const loggedCalories = series.filter((point) => point.calories > 0);
  const avgCalories = loggedCalories.length
    ? Math.round(loggedCalories.reduce((sum, point) => sum + point.calories, 0) / loggedCalories.length)
    : 0;

  const loggedWeights = series.filter((point) => point.weight > 0);
  const hasWeightData = loggedWeights.length >= 2;
  const weightDelta = hasWeightData
    ? Math.round((loggedWeights[loggedWeights.length - 1].weight - loggedWeights[0].weight) * 10) / 10
    : null;

  return {
    series,
    avgCalories,
    weightDelta,
    hasWeightData,
    isLive: true,
  };
}
