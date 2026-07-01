import type {
  BarChartPoint,
  GrowthPoint,
  HabitHeatmapRow,
} from '../../types/statisticsOverview';
import type { HabitLogRow, HabitRow } from '../../types/database';
import {
  addDays,
  buildWeekForDate,
  getWeekStart,
  parseDayKey,
  toDayKey,
} from '../../utils/plannerDates';
import { getAnalyticsBarChartDays, getAnalyticsHeatmapWeeks } from '../subscription/analyticsGating';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';
import { fetchWeeklyProgressScores } from '../welcome/weeklyProgressService';

export type StatisticsOverviewSnapshot = {
  overallGrowth: {
    percent: number;
    rangeLabel: string;
    series: GrowthPoint[];
  };
  habitHeatmap: {
    rangeLabel: string;
    weekLabels: string[];
    rows: HabitHeatmapRow[];
  };
  workoutSessions: BarChartPoint[];
  nutritionCalories: BarChartPoint[];
  financeExpenses: BarChartPoint[];
  financeIncome: BarChartPoint[];
  isLive: boolean;
};

const HEATMAP_DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const DEFAULT_WORKOUT_MINUTES = 45;

export type FetchStatisticsOverviewOptions = {
  isPro?: boolean;
};

function formatWeekRangeLabel(startKey: string, endKey: string): string {
  const start = parseDayKey(startKey);
  const end = parseDayKey(endKey);
  const fmt = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `Last 7 Days (${fmt(start)}–${fmt(end)})`;
}

function buildLastBarChartDays(count: number): Array<{ key: string; label: string }> {
  const today = new Date();
  const days: Array<{ key: string; label: string }> = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    days.push({
      key: toDayKey(date),
      label: String(date.getDate()),
    });
  }

  return days;
}

export function emptyOverview(isPro = false): StatisticsOverviewSnapshot {
  const barDays = buildLastBarChartDays(getAnalyticsBarChartDays(isPro));
  const zeroBars = barDays.map((day) => ({ label: day.label, value: 0 }));
  const heatmapWeeks = getAnalyticsHeatmapWeeks(isPro);

  return {
    overallGrowth: {
      percent: 0,
      rangeLabel: isPro ? 'Last 7 Days' : 'Last 7 Days',
      series: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label) => ({ label, value: 0 })),
    },
    habitHeatmap: {
      rangeLabel: isPro ? 'Last 4 Weeks' : 'Last 7 Days',
      weekLabels: Array.from({ length: heatmapWeeks }, (_, index) =>
        heatmapWeeks === 1 ? 'Week' : `W${index + 1}`,
      ),
      rows: HEATMAP_DAY_LABELS.map((day) => ({
        day,
        weeks: Array.from({ length: heatmapWeeks }, () => 0),
      })),
    },
    workoutSessions: zeroBars,
    nutritionCalories: zeroBars,
    financeExpenses: zeroBars,
    financeIncome: zeroBars,
    isLive: false,
  };
}

function buildHabitHeatmap(habits: HabitRow[], logs: HabitLogRow[], heatmapWeeks: number) {
  const weekStarts = Array.from({ length: heatmapWeeks }, (_, index) =>
    addDays(getWeekStart(), -7 * (heatmapWeeks - 1 - index)),
  );
  const weeks = weekStarts.map((start) => buildWeekForDate(start));
  const startKey = weeks[0][0].key;
  const endKey = weeks[weeks.length - 1][6].key;
  const scopedLogs = logs.filter((log) => log.logged_on >= startKey && log.logged_on <= endKey);

  const rows: HabitHeatmapRow[] = HEATMAP_DAY_LABELS.map((dayLabel, dayIndex) => ({
    day: dayLabel,
    weeks: weeks.map((week) => {
      const dayKey = week[dayIndex].key;
      const dow = parseDayKey(dayKey).getDay();
      const expected = habits.filter((habit) => habit.days_of_week.includes(dow));
      if (expected.length === 0) {
        return 0;
      }

      const completedIds = new Set(
        scopedLogs
          .filter((log) => log.logged_on === dayKey && log.completed)
          .map((log) => log.habit_id),
      );
      const completed = expected.filter((habit) => completedIds.has(habit.id)).length;
      return Math.min(1, completed / expected.length);
    }),
  }));

  return {
    rangeLabel: heatmapWeeks === 1 ? 'Last 7 Days' : 'Last 4 Weeks',
    weekLabels: Array.from({ length: heatmapWeeks }, (_, index) =>
      heatmapWeeks === 1 ? 'Week' : `W${index + 1}`,
    ),
    rows,
  };
}

export async function fetchStatisticsOverview(
  userId: string,
  options: FetchStatisticsOverviewOptions = {},
): Promise<StatisticsOverviewSnapshot> {
  const isPro = options.isPro ?? false;
  const barChartDays = getAnalyticsBarChartDays(isPro);
  const heatmapWeeks = getAnalyticsHeatmapWeeks(isPro);

  if (!isSupabaseConfigured) {
    return emptyOverview(isPro);
  }

  const barDays = buildLastBarChartDays(barChartDays);
  const barStartKey = barDays[0].key;
  const barEndKey = barDays[barDays.length - 1].key;
  const heatmapStartKey = toDayKey(addDays(getWeekStart(), -7 * (heatmapWeeks - 1)));
  const heatmapEndKey = toDayKey(addDays(getWeekStart(), 6));

  const [
    weeklyProgress,
    habitsResult,
    heatmapLogsResult,
    workoutResult,
    nutritionResult,
    transactionsResult,
  ] = await Promise.all([
    fetchWeeklyProgressScores(userId),
    supabase.from('habits').select('id, days_of_week, is_active').eq('user_id', userId).eq('is_active', true),
    supabase
      .from('habit_logs')
      .select('habit_id, completed, logged_on')
      .eq('user_id', userId)
      .gte('logged_on', heatmapStartKey)
      .lte('logged_on', heatmapEndKey),
    supabase
      .from('workout_sessions')
      .select('session_date, completed, duration_minutes')
      .eq('user_id', userId)
      .gte('session_date', barStartKey)
      .lte('session_date', barEndKey),
    supabase
      .from('daily_nutrition_logs')
      .select('log_date, calories_consumed')
      .eq('user_id', userId)
      .gte('log_date', barStartKey)
      .lte('log_date', barEndKey),
    supabase
      .from('transactions')
      .select('type, amount, occurred_at, created_at')
      .eq('user_id', userId)
      .gte('occurred_at', `${barStartKey}T00:00:00.000Z`)
      .lte('occurred_at', `${barEndKey}T23:59:59.999Z`),
  ]);

  const schemaMissing =
    isMissingSchemaError(habitsResult.error) ||
    isMissingSchemaError(heatmapLogsResult.error) ||
    isMissingSchemaError(workoutResult.error) ||
    isMissingSchemaError(nutritionResult.error) ||
    isMissingSchemaError(transactionsResult.error);

  if (schemaMissing) {
    console.warn('[AnalyticsOverview] Schema tables unavailable — showing zero state.');
    return emptyOverview(isPro);
  }

  const habits = (habitsResult.error ? [] : (habitsResult.data ?? [])) as HabitRow[];
  const heatmapLogs = (heatmapLogsResult.error ? [] : (heatmapLogsResult.data ?? [])) as HabitLogRow[];

  const workoutRows = workoutResult.error
    ? []
    : ((workoutResult.data ?? []) as Array<{
        session_date: string;
        completed: boolean;
        duration_minutes: number | null;
      }>);
  const nutritionRows = nutritionResult.error
    ? []
    : ((nutritionResult.data ?? []) as Array<{ log_date: string; calories_consumed: number }>);
  const transactionRows = transactionsResult.error
    ? []
    : ((transactionsResult.data ?? []) as Array<{
        type: 'income' | 'expense';
        amount: number;
        occurred_at: string | null;
        created_at: string;
      }>);

  const workoutByDay = new Map<string, number>();
  for (const row of workoutRows) {
    if (!row.completed) continue;
    const minutes = Number(row.duration_minutes ?? 0);
    workoutByDay.set(
      row.session_date,
      (workoutByDay.get(row.session_date) ?? 0) + (minutes > 0 ? minutes : DEFAULT_WORKOUT_MINUTES),
    );
  }

  const nutritionByDay = new Map<string, number>();
  for (const row of nutritionRows) {
    nutritionByDay.set(row.log_date, Math.round(Number(row.calories_consumed ?? 0)));
  }

  const expenseByDay = new Map<string, number>();
  const incomeByDay = new Map<string, number>();
  for (const row of transactionRows) {
    const stamp = row.occurred_at ?? row.created_at;
    const dayKey = stamp.slice(0, 10);
    const amount = Math.round(Number(row.amount ?? 0));
    if (row.type === 'expense') {
      expenseByDay.set(dayKey, (expenseByDay.get(dayKey) ?? 0) + amount);
    } else {
      incomeByDay.set(dayKey, (incomeByDay.get(dayKey) ?? 0) + amount);
    }
  }

  const workoutSessions = barDays.map((day) => ({
    label: day.label,
    value: workoutByDay.get(day.key) ?? 0,
  }));
  const nutritionCalories = barDays.map((day) => ({
    label: day.label,
    value: nutritionByDay.get(day.key) ?? 0,
  }));
  const financeExpenses = barDays.map((day) => ({
    label: day.label,
    value: expenseByDay.get(day.key) ?? 0,
  }));
  const financeIncome = barDays.map((day) => ({
    label: day.label,
    value: incomeByDay.get(day.key) ?? 0,
  }));

  const series: GrowthPoint[] = weeklyProgress.days.map((day) => ({
    label: day.shortLabel,
    value: day.score,
    highlight: day.isToday,
  }));

  return {
    overallGrowth: {
      percent: weeklyProgress.averagePercent,
      rangeLabel: formatWeekRangeLabel(weeklyProgress.days[0]?.dayKey ?? barStartKey, weeklyProgress.days[6]?.dayKey ?? barEndKey),
      series,
    },
    habitHeatmap: buildHabitHeatmap(habits, heatmapLogs, heatmapWeeks),
    workoutSessions,
    nutritionCalories,
    financeExpenses,
    financeIncome,
    isLive: true,
  };
}
