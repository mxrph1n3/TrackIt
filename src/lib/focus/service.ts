import type { FocusSessionType } from '../../types/focus';
import { toDayKey } from '../../utils/plannerDates';
import { isSupabaseConfigured, supabase } from '../supabase';

function dayBounds(dayKey = toDayKey(new Date())): { start: string; end: string } {
  const start = new Date(`${dayKey}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function fetchFocusMinutesForDay(
  userId: string,
  dayKey = toDayKey(new Date()),
): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0;
  }

  const { start, end } = dayBounds(dayKey);
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('session_type', 'focus')
    .gte('completed_at', start)
    .lt('completed_at', end);

  if (error) {
    return 0;
  }

  const totalSeconds = (data ?? []).reduce(
    (sum, row) => sum + Number(row.duration_seconds ?? 0),
    0,
  );

  return Math.round(totalSeconds / 60);
}

export async function recordFocusSession(
  userId: string,
  sessionType: FocusSessionType,
  durationSeconds: number,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error: insertError } = await supabase.from('focus_sessions').insert({
    user_id: userId,
    session_type: sessionType,
    duration_seconds: durationSeconds,
  });

  if (insertError) {
    throw insertError;
  }

  if (sessionType !== 'focus') {
    return;
  }

  const hoursAdded = durationSeconds / 3600;

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('focus_hours')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  const nextHours = Number(profile?.focus_hours ?? 0) + hoursAdded;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ focus_hours: nextHours })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }
}

export async function fetchFocusSessionsThisWeek(userId: string): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0;
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { count, error } = await supabase
    .from('focus_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('session_type', 'focus')
    .gte('completed_at', weekAgo.toISOString());

  if (error) {
    return 0;
  }

  return count ?? 0;
}
