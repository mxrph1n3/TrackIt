import { isSupabaseConfigured, supabase } from '../supabase';
import type { HabitLogRow, HabitRow } from '../../types/database';
import { buildCurrentWeek } from '../../utils/plannerDates';

export type WeeklyDayScore = {
  dayKey: string;
  shortLabel: string;
  score: number;
  isToday: boolean;
};

export type WeeklyProgressData = {
  days: WeeklyDayScore[];
  averagePercent: number;
};

const SHORT_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

function dayScore(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

function emptyWeek(): WeeklyProgressData {
  const week = buildCurrentWeek();
  const days = week.map((day, index) => ({
    dayKey: day.key,
    shortLabel: SHORT_LABELS[index],
    score: 0,
    isToday: day.isToday,
  }));

  return { days, averagePercent: 0 };
}

export async function fetchWeeklyProgressScores(userId: string): Promise<WeeklyProgressData> {
  const week = buildCurrentWeek();
  const startKey = week[0].key;
  const endKey = week[6].key;

  if (!isSupabaseConfigured) {
    return emptyWeek();
  }

  const [tasksResult, habitsResult, logsResult, workoutResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('completed, due_date, is_today, created_at')
      .eq('user_id', userId),
    supabase.from('habits').select('id, days_of_week, is_active').eq('user_id', userId).eq('is_active', true),
    supabase
      .from('habit_logs')
      .select('habit_id, completed, logged_on')
      .eq('user_id', userId)
      .gte('logged_on', startKey)
      .lte('logged_on', endKey),
    supabase
      .from('workout_sessions')
      .select('session_date, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('session_date', startKey)
      .lte('session_date', endKey),
  ]);

  if (tasksResult.error && habitsResult.error && logsResult.error && workoutResult.error) {
    console.warn('[WelcomeGate] weekly data unavailable:', tasksResult.error?.message);
    return emptyWeek();
  }

  type TaskRow = {
    completed: boolean;
    due_date: string | null;
    is_today: boolean;
    created_at: string;
  };

  const tasks = (tasksResult.error ? [] : (tasksResult.data ?? [])) as TaskRow[];
  const habits = (habitsResult.error ? [] : (habitsResult.data ?? [])) as HabitRow[];
  const logs = (logsResult.error ? [] : (logsResult.data ?? [])) as HabitLogRow[];
  const workoutDays = new Set(
    (workoutResult.error ? [] : (workoutResult.data ?? [])).map((row) => String(row.session_date)),
  );

  const weekKeys = new Set(week.map((day) => day.key));
  const scopedTasks = tasks.filter((task) => {
    if (task.due_date && weekKeys.has(task.due_date)) return true;
    if (task.is_today && week.some((day) => day.isToday)) return true;
    return weekKeys.has(task.created_at.slice(0, 10));
  });

  const days = week.map((day, index) => {
    const date = new Date(`${day.key}T12:00:00`);
    const dow = date.getDay();

    const dayTasks = scopedTasks.filter((task) => {
      if (task.due_date === day.key) return true;
      if (!task.due_date && task.is_today && day.isToday) return true;
      if (!task.due_date && task.created_at.slice(0, 10) === day.key) return true;
      return false;
    });

    const expectedHabits = habits.filter((habit) => habit.days_of_week.includes(dow));
    const completedHabitIds = new Set(
      logs
        .filter((log) => log.logged_on === day.key && log.completed)
        .map((log) => log.habit_id),
    );
    const loggedHabits = expectedHabits.filter((habit) => completedHabitIds.has(habit.id)).length;

    const completedTasks = dayTasks.filter((task) => task.completed).length;
    const workoutDone = workoutDays.has(day.key);
    const completedItems = completedTasks + loggedHabits + (workoutDone ? 1 : 0);
    const totalItems = dayTasks.length + expectedHabits.length + 1;
    const score = dayScore(completedItems, totalItems);

    return {
      dayKey: day.key,
      shortLabel: SHORT_LABELS[index],
      score,
      isToday: day.isToday,
    };
  });

  const averagePercent = days.length
    ? Math.round(days.reduce((sum, day) => sum + day.score, 0) / days.length)
    : 0;

  return { days, averagePercent };
}
