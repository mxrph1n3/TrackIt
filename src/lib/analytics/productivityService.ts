import type { TaskCompletionPoint } from '../../types/analytics';
import { buildCurrentWeek, toDayKey } from '../../utils/plannerDates';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export type ProductivityAnalyticsSnapshot = {
  focusHeatmap: number[][];
  heatmapDayLabels: string[];
  taskCompletion: TaskCompletionPoint[];
  isLive: boolean;
};

const FOCUS_BLOCKS = 12;
const BLOCK_HOURS = 2;

function formatDayLabel(label: string): string {
  return label.charAt(0) + label.slice(1, 3).toLowerCase();
}

export function emptyProductivity(): ProductivityAnalyticsSnapshot {
  const week = buildCurrentWeek();
  return {
    focusHeatmap: Array.from({ length: 7 }, () => Array(FOCUS_BLOCKS).fill(0)),
    heatmapDayLabels: week.map((day) => formatDayLabel(day.label)),
    taskCompletion: week.map((day) => ({
      day: formatDayLabel(day.label),
      percent: 0,
    })),
    isLive: false,
  };
}

function buildFocusHeatmap(
  week: ReturnType<typeof buildCurrentWeek>,
  sessions: Array<{ completed_at: string; duration_seconds: number }>,
): number[][] {
  const grid = Array.from({ length: 7 }, () => Array(FOCUS_BLOCKS).fill(0));

  for (const session of sessions) {
    const completedAt = new Date(session.completed_at);
    const dayKey = toDayKey(completedAt);
    const rowIndex = week.findIndex((day) => day.key === dayKey);
    if (rowIndex < 0) continue;

    const blockIndex = Math.min(FOCUS_BLOCKS - 1, Math.floor(completedAt.getHours() / BLOCK_HOURS));
    grid[rowIndex][blockIndex] += Number(session.duration_seconds ?? 0);
  }

  const blockCapacity = BLOCK_HOURS * 3600;
  return grid.map((row) => row.map((seconds) => Math.min(1, seconds / blockCapacity)));
}

function buildTaskCompletion(
  week: ReturnType<typeof buildCurrentWeek>,
  tasks: Array<{ completed: boolean; due_date: string | null; is_today: boolean; created_at: string }>,
): TaskCompletionPoint[] {
  return week.map((day) => {
    const dayTasks = tasks.filter((task) => {
      if (task.due_date === day.key) return true;
      if (!task.due_date && task.is_today && day.isToday) return true;
      if (!task.due_date && task.created_at.slice(0, 10) === day.key) return true;
      return false;
    });

    const total = dayTasks.length;
    const completed = dayTasks.filter((task) => task.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      day: formatDayLabel(day.label),
      percent,
    };
  });
}

export async function fetchProductivityAnalytics(userId: string): Promise<ProductivityAnalyticsSnapshot> {
  if (!isSupabaseConfigured) {
    return emptyProductivity();
  }

  const week = buildCurrentWeek();
  const startKey = week[0].key;
  const endKey = week[6].key;
  const startIso = `${startKey}T00:00:00.000`;
  const endIso = `${endKey}T23:59:59.999`;

  const [focusResult, tasksResult] = await Promise.all([
    supabase
      .from('focus_sessions')
      .select('completed_at, duration_seconds')
      .eq('user_id', userId)
      .eq('session_type', 'focus')
      .gte('completed_at', startIso)
      .lte('completed_at', endIso),
    supabase
      .from('tasks')
      .select('completed, due_date, is_today, created_at')
      .eq('user_id', userId),
  ]);

  if (isMissingSchemaError(focusResult.error) || isMissingSchemaError(tasksResult.error)) {
    console.warn('[ProductivityAnalytics] Schema unavailable — showing zero state.');
    return emptyProductivity();
  }

  const sessions = focusResult.error
    ? []
    : ((focusResult.data ?? []) as Array<{ completed_at: string; duration_seconds: number }>);

  type TaskRow = {
    completed: boolean;
    due_date: string | null;
    is_today: boolean;
    created_at: string;
  };

  const allTasks = (tasksResult.error ? [] : (tasksResult.data ?? [])) as TaskRow[];
  const weekKeys = new Set(week.map((day) => day.key));
  const scopedTasks = allTasks.filter((task) => {
    if (task.due_date && weekKeys.has(task.due_date)) return true;
    if (task.is_today && week.some((day) => day.isToday)) return true;
    return weekKeys.has(task.created_at.slice(0, 10));
  });

  return {
    focusHeatmap: buildFocusHeatmap(week, sessions),
    heatmapDayLabels: week.map((day) => formatDayLabel(day.label)),
    taskCompletion: buildTaskCompletion(week, scopedTasks),
    isLive: true,
  };
}
