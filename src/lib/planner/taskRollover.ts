import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';
import { toDayKey } from '../../utils/plannerDates';

function dayStartIso(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

/** Supabase `.or()` filter for tasks that belong on a given calendar day. */
export function buildTasksForDayOrFilter(dayKey: string, start: string, end: string): string {
  const todayKey = toDayKey(new Date());

  if (dayKey === todayKey) {
    // Carry incomplete is_today tasks forward; hide completed ones from prior days.
    return `due_date.eq.${dayKey},and(created_at.gte.${start},created_at.lt.${end}),and(is_today.eq.true,completed.eq.false)`;
  }

  return `due_date.eq.${dayKey},and(created_at.gte.${start},created_at.lt.${end})`;
}

/** Clear is_today on completed tasks from before today so they do not reappear. */
export async function rolloverStaleTodayTasks(userId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const todayKey = toDayKey(new Date());
  const start = dayStartIso(todayKey);

  const { error } = await supabase
    .from('tasks')
    .update({ is_today: false })
    .eq('user_id', userId)
    .eq('is_today', true)
    .eq('completed', true)
    .lt('created_at', start);

  if (error && !isMissingSchemaError(error)) {
    console.warn('[Planner] rolloverStaleTodayTasks failed:', error.message);
  }
}
