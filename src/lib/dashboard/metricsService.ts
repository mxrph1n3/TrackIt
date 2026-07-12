import { isSupabaseConfigured, isMissingSchemaError, supabase } from '../supabase';
import { reportSyncError } from '../sync/reportSyncError';
import { fetchFocusMinutesForDay } from '../focus/service';
import type {
  DailyNutritionLogRow,
  HabitLogRow,
  HabitRow,
} from '../../types/database';
import type { DashboardMetricsRaw } from './metrics';
import { DEFAULT_FOCUS_MINUTES_TARGET } from './metrics';
import { toDayKey } from '../../utils/plannerDates';

export type TaskMetricsRow = {
  completed: boolean;
};

const DEFAULT_CALORIE_TARGET = 1700;

function todayKey(reference = new Date()): string {
  return toDayKey(reference);
}

function todayDayOfWeek(reference = new Date()): number {
  return reference.getDay();
}

export async function fetchDashboardMetricsRaw(
  userId: string,
  fallback: Pick<DashboardMetricsRaw, 'consumedCalories' | 'calorieTarget' | 'workoutCompletedToday'>,
): Promise<DashboardMetricsRaw> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const today = todayKey();
  const dayOfWeek = todayDayOfWeek();

  const [tasksResult, habitsResult, habitLogsResult, workoutResult, nutritionResult, focusMinutesToday] =
    await Promise.all([
      fetchTodayTaskMetrics(userId, today),
      supabase.from('habits').select('id, days_of_week, is_active').eq('user_id', userId).eq('is_active', true),
      supabase.from('habit_logs').select('habit_id, completed').eq('user_id', userId).eq('logged_on', today),
      supabase
        .from('workout_sessions')
        .select('completed')
        .eq('user_id', userId)
        .eq('session_date', today)
        .maybeSingle(),
      supabase
        .from('daily_nutrition_logs')
        .select('calories_consumed, calorie_target')
        .eq('user_id', userId)
        .eq('log_date', today)
        .maybeSingle(),
      fetchFocusMinutesForDay(userId, today),
    ]);

  if (tasksResult.error) {
    if (isMissingSchemaError(tasksResult.error)) {
      console.warn('[DashboardMetrics] tasks table unavailable; using zero task metrics.');
    } else {
      throw tasksResult.error;
    }
  }

  const tasks = tasksResult.error ? [] : tasksResult.data;
  const habits = (habitsResult.error ? [] : (habitsResult.data ?? [])) as HabitRow[];
  const habitLogs = (habitLogsResult.error ? [] : (habitLogsResult.data ?? [])) as HabitLogRow[];

  const expectedHabits = habits.filter((habit) => habit.days_of_week.includes(dayOfWeek));
  const completedHabitIds = new Set(
    habitLogs.filter((log) => log.completed).map((log) => log.habit_id),
  );
  const loggedHabits = expectedHabits.filter((habit) => completedHabitIds.has(habit.id)).length;

  const workoutCompletedToday =
    !workoutResult.error && workoutResult.data?.completed === true
      ? true
      : fallback.workoutCompletedToday;

  const nutritionRow = nutritionResult.error ? null : (nutritionResult.data as DailyNutritionLogRow | null);
  const consumedCalories =
    nutritionRow != null ? Math.max(0, Number(nutritionRow.calories_consumed ?? 0)) : 0;
  const calorieTarget =
    nutritionRow && Number(nutritionRow.calorie_target) > 0
      ? Number(nutritionRow.calorie_target)
      : fallback.calorieTarget;

  return {
    completedTasks: tasks.filter((task) => task.completed).length,
    totalTasks: tasks.length,
    loggedHabits,
    expectedHabits: expectedHabits.length,
    focusMinutesToday,
    focusMinutesTarget: DEFAULT_FOCUS_MINUTES_TARGET,
    workoutCompletedToday,
    consumedCalories,
    calorieTarget,
  };
}

export async function upsertDailyNutritionLog(
  userId: string,
  caloriesConsumed: number,
  calorieTarget = DEFAULT_CALORIE_TARGET,
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const logDate = todayKey();
  const { error } = await supabase.from('daily_nutrition_logs').upsert(
    {
      user_id: userId,
      log_date: logDate,
      calories_consumed: Math.round(caloriesConsumed),
      calorie_target: calorieTarget,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,log_date' },
  );

  if (error) {
    console.warn('[DashboardMetrics] Failed to upsert nutrition log:', error.message);
  }
}

export type WorkoutSessionWriteInput = {
  durationMinutes?: number;
  xpEarned?: number;
  trackSlug?: string;
  dayFocus?: string;
  caloriesBurned?: number;
  tonnageKg?: number;
};

export async function upsertWorkoutSessionComplete(
  userId: string,
  input: WorkoutSessionWriteInput = {},
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const sessionDate = todayKey();
  const basePayload = {
    user_id: userId,
    session_date: sessionDate,
    completed: true,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const fullPayload = {
    ...basePayload,
    duration_minutes: Math.max(0, Math.round(input.durationMinutes ?? 0)),
    xp_earned: Math.max(0, Math.round(input.xpEarned ?? 0)),
    track_slug: input.trackSlug ?? null,
    day_focus: input.dayFocus ?? null,
    calories_burned: Math.max(0, Math.round(input.caloriesBurned ?? 0)),
    tonnage_kg: Math.max(0, Math.round(input.tonnageKg ?? 0)),
  };

  let { error } = await supabase
    .from('workout_sessions')
    .upsert(fullPayload, { onConflict: 'user_id,session_date' });

  if (error) {
    ({ error } = await supabase
      .from('workout_sessions')
      .upsert(basePayload, { onConflict: 'user_id,session_date' }));
  }

  if (error) {
    if (isMissingSchemaError(error)) {
      console.warn('[DashboardMetrics] workout_sessions table unavailable.');
      return false;
    }

    reportSyncError('Workout', error, 'Could not save workout to your stats.');
    return false;
  }

  return true;
}

export { DEFAULT_CALORIE_TARGET };

async function fetchTodayTaskMetrics(
  userId: string,
  today: string,
): Promise<{ data: TaskMetricsRow[]; error: Error | null }> {
  const primary = await supabase
    .from('tasks')
    .select('completed')
    .eq('user_id', userId)
    .eq('due_date', today);

  if (!primary.error) {
    return { data: (primary.data ?? []) as TaskMetricsRow[], error: null };
  }

  const legacy = await supabase
    .from('tasks')
    .select('completed')
    .eq('user_id', userId)
    .eq('is_today', true);

  if (legacy.error) {
    if (isMissingSchemaError(primary.error) || isMissingSchemaError(legacy.error)) {
      return { data: [], error: null };
    }
    return { data: [], error: legacy.error as Error };
  }

  return { data: (legacy.data ?? []) as TaskMetricsRow[], error: null };
}
