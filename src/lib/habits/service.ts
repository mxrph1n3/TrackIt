import type { HabitLogRow, HabitRow } from '../../types/database';
import { isSupabaseConfigured, supabase } from '../supabase';
import { toDayKey } from '../../utils/plannerDates';

export type HabitDayCell = {
  key: string;
  label: string;
  date: number;
  isToday: boolean;
  completed: boolean;
};

export type HabitWithWeek = {
  habit: HabitRow;
  streakDays: number;
  week: HabitDayCell[];
};

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function buildLastSevenDays(reference = new Date()): HabitDayCell[] {
  const days: HabitDayCell[] = [];
  const todayKey = toDayKey(reference);

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(reference);
    date.setHours(12, 0, 0, 0);
    date.setDate(reference.getDate() - offset);
    const key = toDayKey(date);

    days.push({
      key,
      label: DAY_LABELS[date.getDay()],
      date: date.getDate(),
      isToday: key === todayKey,
      completed: false,
    });
  }

  return days;
}

export function computeHabitStreak(
  completedDayKeys: Set<string>,
  reference = new Date(),
): number {
  let streak = 0;
  const cursor = new Date(reference);
  cursor.setHours(12, 0, 0, 0);

  while (completedDayKeys.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function fetchHabitsWithWeek(
  userId: string,
  reference = new Date(),
): Promise<HabitWithWeek[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const weekTemplate = buildLastSevenDays(reference);
  const rangeStart = weekTemplate[0]?.key;
  const rangeEnd = weekTemplate[weekTemplate.length - 1]?.key;

  const [habitsResult, logsResult] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_on', rangeStart)
      .lte('logged_on', rangeEnd),
  ]);

  if (habitsResult.error) {
    throw habitsResult.error;
  }

  const habits = (habitsResult.data ?? []) as HabitRow[];
  const logs = (logsResult.error ? [] : (logsResult.data ?? [])) as HabitLogRow[];

  const logsByHabit = new Map<string, Map<string, boolean>>();
  for (const log of logs) {
    if (!logsByHabit.has(log.habit_id)) {
      logsByHabit.set(log.habit_id, new Map());
    }
    logsByHabit.get(log.habit_id)?.set(log.logged_on, log.completed);
  }

  const allCompletedKeys = new Map<string, Set<string>>();
  for (const log of logs) {
    if (!log.completed) {
      continue;
    }
    if (!allCompletedKeys.has(log.habit_id)) {
      allCompletedKeys.set(log.habit_id, new Set());
    }
    allCompletedKeys.get(log.habit_id)?.add(log.logged_on);
  }

  const streakRangeStart = new Date(reference);
  streakRangeStart.setDate(streakRangeStart.getDate() - 60);

  const streakLogsResult = await supabase
    .from('habit_logs')
    .select('habit_id, logged_on, completed')
    .eq('user_id', userId)
    .gte('logged_on', toDayKey(streakRangeStart))
    .eq('completed', true);

  const streakSets = new Map<string, Set<string>>();
  for (const row of streakLogsResult.data ?? []) {
    const habitId = String(row.habit_id);
    if (!streakSets.has(habitId)) {
      streakSets.set(habitId, new Set());
    }
    streakSets.get(habitId)?.add(String(row.logged_on));
  }

  return habits.map((habit) => {
    const dayMap = logsByHabit.get(habit.id) ?? new Map();
    const week = weekTemplate.map((day) => ({
      ...day,
      completed: dayMap.get(day.key) === true,
    }));

    const streakDays = computeHabitStreak(streakSets.get(habit.id) ?? new Set(), reference);

    return { habit, streakDays, week };
  });
}

export async function fetchHabitStreakDays(
  userId: string,
  habitId: string,
  reference = new Date(),
): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0;
  }

  const rangeStart = new Date(reference);
  rangeStart.setDate(rangeStart.getDate() - 120);

  const { data, error } = await supabase
    .from('habit_logs')
    .select('logged_on')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('completed', true)
    .gte('logged_on', toDayKey(rangeStart));

  if (error) {
    return 0;
  }

  const completedDayKeys = new Set((data ?? []).map((row) => String(row.logged_on)));
  return computeHabitStreak(completedDayKeys, reference);
}

export async function toggleHabitLog(
  userId: string,
  habitId: string,
  dayKey: string,
  completed: boolean,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('habit_logs').upsert(
    {
      habit_id: habitId,
      user_id: userId,
      logged_on: dayKey,
      completed,
    },
    { onConflict: 'habit_id,logged_on' },
  );

  if (error) {
    throw error;
  }
}

export async function createHabit(userId: string, title: string): Promise<HabitRow> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('Habit title is required.');
  }

  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: userId, title: trimmed })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as HabitRow;
}
