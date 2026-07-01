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

export async function fetchTodayTasks(userId: string): Promise<ScheduleItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const today = toDayKey(new Date());

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('due_date', today)
    .order('created_at', { ascending: true });

  if (error) {
    const legacy = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_today', true)
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

  return (data as TaskRow[]).map(mapTaskToScheduleItem);
}

function mapTaskToScheduleItem(task: TaskRow): ScheduleItem {
  return {
    id: task.id,
    title: task.title,
    time: formatTaskTime(task.scheduled_time, task.created_at),
    completed: task.completed,
  };
}

import { markUserActivityToday } from '../notifications/activityTracking';

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.from('tasks').update({ completed }).eq('id', taskId);

  if (error) {
    if (isMissingSchemaError(error)) {
      console.warn('[Dashboard] tasks table unavailable; toggle ignored.');
      return;
    }
    throw error;
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
