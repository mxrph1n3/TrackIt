import { markUserActivityToday } from '../notifications/activityTracking';
import { isSupabaseConfigured, isMissingSchemaError, supabase } from '../supabase';
import { fetchDashboardFinance } from '../finance/dashboardFinance';
import type { TaskRow } from '../../types/quickActionRecords';
import type { DashboardFinanceSnapshot } from '../../types/dashboard';
import type { ScheduleItem } from '../../types/dashboard';
import { toDayKey } from '../../utils/plannerDates';

function formatTaskTime(scheduledTime: string | null, createdAt: string): string {
  if (scheduledTime?.trim()) {
    return scheduledTime.trim();
  }
  const date = new Date(createdAt);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function dayRangeIso(dayKey: string): { start: string; end: string } {
  const [year, month, day] = dayKey.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function fetchTodayTasks(userId: string): Promise<ScheduleItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const today = toDayKey(new Date());
  const { start, end } = dayRangeIso(today);

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .or(`due_date.eq.${today},is_today.eq.true,and(created_at.gte.${start},created_at.lt.${end})`)
    .order('created_at', { ascending: true });

  if (error) {
    const legacy = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('due_date', today)
      .order('created_at', { ascending: true });

    if (legacy.error) {
      if (isMissingSchemaError(error) || isMissingSchemaError(legacy.error)) {
        console.warn('[Dashboard] tasks table unavailable; using empty schedule.');
        return [];
      }
      throw legacy.error;
    }

    return (legacy.data as TaskRow[]).map(mapTaskToScheduleItem);
  }

  const uniqueById = new Map<string, TaskRow>();
  for (const row of (data ?? []) as TaskRow[]) {
    uniqueById.set(row.id, row);
  }

  return [...uniqueById.values()].map(mapTaskToScheduleItem);
}

function mapTaskToScheduleItem(task: TaskRow): ScheduleItem {
  return {
    id: task.id,
    title: task.title,
    time: formatTaskTime(task.scheduled_time, task.created_at),
    completed: task.completed,
  };
}

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('You must be signed in to update tasks.');
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id, completed')
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      throw new Error('Tasks table is unavailable.');
    }
    throw error;
  }

  if (!data) {
    throw new Error('Task not found or you do not have permission to update it.');
  }

  if (completed) {
    void markUserActivityToday();
  }
}

export async function fetchFinanceSnapshot(
  userId: string,
  cardholder = 'TRACKIT MEMBER',
): Promise<DashboardFinanceSnapshot> {
  return fetchDashboardFinance(userId, cardholder);
}
