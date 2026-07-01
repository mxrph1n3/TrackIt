import { isSupabaseConfigured, isMissingSchemaError, supabase } from '../supabase';
import { fetchSubtasksForTaskIds } from './subtaskService';
import type { JournalEntry, PlannerEventItem, PlannerHabitItem, PlannerTaskItem } from '../../types/planner';
import type { HabitLogRow, HabitRow } from '../../types/database';
import type { TaskRow } from '../../types/quickActionRecords';
import { addDays, parseDayKey, toDayKey } from '../../utils/plannerDates';

function formatTaskTime(scheduledTime: string | null, createdAt: string): string {
  if (scheduledTime?.trim()) {
    return scheduledTime.trim();
  }
  return new Date(createdAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function dayRangeIso(dayKey: string): { start: string; end: string } {
  const [year, month, day] = dayKey.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export type TaskListFilter = 'all' | 'open' | 'done';

function formatTaskDayLabel(dueDate: string | null | undefined, createdAt: string): string {
  const key = dueDate ?? createdAt.slice(0, 10);
  const date = parseDayKey(key);
  const todayKey = toDayKey(new Date());
  if (key === todayKey) {
    return 'Today';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export async function fetchAllTasks(
  userId: string,
  filter: TaskListFilter = 'all',
  limit = 100,
): Promise<PlannerTaskItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (filter === 'open') {
    query = query.eq('completed', false);
  } else if (filter === 'done') {
    query = query.eq('completed', true);
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingSchemaError(error)) {
      return [];
    }
    throw error;
  }

  const rows = (data as TaskRow[]).map((task) => ({
    id: task.id,
    title: task.title,
    time: formatTaskTime(task.scheduled_time, task.created_at),
    completed: task.completed,
    dayLabel: formatTaskDayLabel(task.due_date, task.created_at),
  }));

  const taskIds = rows.map((task) => task.id);
  const subtasksByTask = await fetchSubtasksForTaskIds(userId, taskIds);

  return rows.map((task) => ({
    ...task,
    subtasks: subtasksByTask.get(task.id),
  }));
}

export async function fetchJournalEntry(
  userId: string,
  dayKey: string,
): Promise<JournalEntry | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error) || error.code === '42P01') {
      return null;
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as { body: string; updated_at: string; created_at: string };
  const stamp = row.updated_at ?? row.created_at;

  return {
    body: row.body,
    timestamp: new Date(stamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  };
}

export async function fetchTasksForDay(userId: string, dayKey: string): Promise<PlannerTaskItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { start, end } = dayRangeIso(dayKey);
  const todayKey = toDayKey(new Date());

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (dayKey === todayKey) {
    query = query.or(
      `due_date.eq.${dayKey},is_today.eq.true,and(created_at.gte.${start},created_at.lt.${end})`,
    );
  } else {
    query = query.or(`due_date.eq.${dayKey},and(created_at.gte.${start},created_at.lt.${end})`);
  }

  const { data, error } = await query;

  if (error) {
    const legacy = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('due_date', dayKey)
      .order('created_at', { ascending: true });

    if (legacy.error) {
      if (isMissingSchemaError(error) || isMissingSchemaError(legacy.error)) {
        console.warn('[Planner] tasks table unavailable; using empty task list.');
        return [];
      }
      throw legacy.error;
    }

    const rows = (legacy.data as TaskRow[]).map(mapPlannerTaskRow);
    return attachSubtasks(userId, rows);
  }

  const uniqueById = new Map<string, TaskRow>();
  for (const row of (data ?? []) as TaskRow[]) {
    uniqueById.set(row.id, row);
  }

  const rows = [...uniqueById.values()].map(mapPlannerTaskRow);
  return attachSubtasks(userId, rows);
}

function mapPlannerTaskRow(task: TaskRow) {
  return {
    id: task.id,
    title: task.title,
    time: formatTaskTime(task.scheduled_time, task.created_at),
    completed: task.completed,
    dueDate: task.due_date ?? task.created_at.slice(0, 10),
  };
}

async function attachSubtasks(
  userId: string,
  rows: Array<{ id: string; title: string; time: string; completed: boolean; dueDate?: string }>,
): Promise<PlannerTaskItem[]> {
  const taskIds = rows.map((task) => task.id);
  const subtasksByTask = await fetchSubtasksForTaskIds(userId, taskIds);

  return rows.map((task) => ({
    ...task,
    subtasks: subtasksByTask.get(task.id),
  }));
}

export async function fetchTasksForTimeline(
  userId: string,
  anchorDayKey: string,
): Promise<PlannerTaskItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const startKey = toDayKey(addDays(parseDayKey(anchorDayKey), -2));
  const endKey = toDayKey(addDays(parseDayKey(anchorDayKey), 1));
  const todayKey = toDayKey(new Date());

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('due_date', startKey)
    .lte('due_date', endKey)
    .order('due_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) {
      return [];
    }
    throw error;
  }

  const rows = [...((data ?? []) as TaskRow[])];

  if (todayKey >= startKey && todayKey <= endKey) {
    const todayResult = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_today', true)
      .order('created_at', { ascending: true });

    if (!todayResult.error && todayResult.data) {
      const seen = new Set(rows.map((row) => row.id));
      for (const row of todayResult.data as TaskRow[]) {
        if (!seen.has(row.id)) {
          rows.push(row);
        }
      }
    }
  }

  const uniqueById = new Map<string, TaskRow>();
  for (const row of rows) {
    uniqueById.set(row.id, row);
  }

  return attachSubtasks(userId, [...uniqueById.values()].map(mapPlannerTaskRow));
}

export async function fetchHabitsForDay(userId: string, dayKey: string): Promise<PlannerHabitItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const dayOfWeek = parseDayKey(dayKey).getDay();

  const [habitsResult, logsResult] = await Promise.all([
    supabase
      .from('habits')
      .select('id, title, days_of_week, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('user_id', userId)
      .eq('logged_on', dayKey),
  ]);

  if (isMissingSchemaError(habitsResult.error) || isMissingSchemaError(logsResult.error)) {
    return [];
  }

  if (habitsResult.error) {
    throw habitsResult.error;
  }

  const habits = (habitsResult.data ?? []) as HabitRow[];
  const logs = (logsResult.error ? [] : (logsResult.data ?? [])) as HabitLogRow[];
  const completedIds = new Set(logs.filter((log) => log.completed).map((log) => log.habit_id));

  return habits
    .filter((habit) => habit.days_of_week.includes(dayOfWeek))
    .map((habit) => ({
      id: habit.id,
      label: habit.title,
      completed: completedIds.has(habit.id),
    }));
}

export async function fetchCalendarEventsForDay(
  userId: string,
  dayKey: string,
): Promise<PlannerEventItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { start, end } = dayRangeIso(dayKey);
  const todayKey = toDayKey(new Date());

  let query = supabase
    .from('tasks')
    .select('id, title, scheduled_time, due_date, created_at')
    .eq('user_id', userId)
    .not('scheduled_time', 'is', null)
    .order('scheduled_time', { ascending: true });

  if (dayKey === todayKey) {
    query = query.or(`due_date.eq.${dayKey},and(created_at.gte.${start},created_at.lt.${end})`);
  } else {
    query = query.or(`due_date.eq.${dayKey},and(created_at.gte.${start},created_at.lt.${end})`);
  }

  const { data, error } = await query;

  if (isMissingSchemaError(error)) {
    return [];
  }

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
    time: String(row.scheduled_time ?? ''),
  }));
}

export async function upsertJournalEntry(
  userId: string,
  dayKey: string,
  body: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error('Journal entry cannot be empty.');
  }

  const { error } = await supabase.from('journal_entries').upsert(
    {
      user_id: userId,
      day_key: dayKey,
      body: trimmed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day_key' },
  );

  if (error) {
    throw error;
  }
}
