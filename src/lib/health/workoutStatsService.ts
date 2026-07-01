import type { WorkoutLifetimeStats } from '../../types/health';
import { addDays, parseDayKey, toDayKey } from '../../utils/plannerDates';
import { fetchPersonalRecordCount } from './exercisePrService';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export const EMPTY_LIFETIME_STATS: WorkoutLifetimeStats = {
  totalWorkouts: 0,
  streakDays: 0,
  longestStreakDays: 0,
  totalMinutes: 0,
  totalTonnageKg: 0,
  personalRecordCount: 0,
};

function computeStreaks(sessionDates: string[]): { streakDays: number; longestStreakDays: number } {
  if (sessionDates.length === 0) {
    return { streakDays: 0, longestStreakDays: 0 };
  }

  const unique = [...new Set(sessionDates)].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < unique.length; index += 1) {
    const prev = parseDayKey(unique[index - 1]);
    const next = parseDayKey(unique[index]);
    const expected = toDayKey(addDays(prev, 1));
    if (unique[index] === expected) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  const todayKey = toDayKey(new Date());
  const yesterdayKey = toDayKey(addDays(new Date(), -1));
  const lastKey = unique[unique.length - 1];
  let streakDays = 0;

  if (lastKey === todayKey || lastKey === yesterdayKey) {
    streakDays = 1;
    for (let index = unique.length - 2; index >= 0; index -= 1) {
      const expected = toDayKey(addDays(parseDayKey(unique[index + 1]), -1));
      if (unique[index] === expected) {
        streakDays += 1;
      } else {
        break;
      }
    }
  }

  return { streakDays, longestStreakDays: longest };
}

/** Keeps optimistic local totals when the DB read lags behind a just-finished workout. */
export function mergeLifetimeStats(
  local: WorkoutLifetimeStats,
  remote: WorkoutLifetimeStats,
): WorkoutLifetimeStats {
  return {
    totalWorkouts: Math.max(local.totalWorkouts, remote.totalWorkouts),
    streakDays: Math.max(local.streakDays, remote.streakDays),
    longestStreakDays: Math.max(local.longestStreakDays, remote.longestStreakDays),
    totalMinutes: Math.max(local.totalMinutes, remote.totalMinutes),
    totalTonnageKg: Math.max(local.totalTonnageKg, remote.totalTonnageKg),
    personalRecordCount: Math.max(local.personalRecordCount, remote.personalRecordCount),
  };
}

export async function fetchWorkoutLifetimeStats(userId: string): Promise<WorkoutLifetimeStats> {
  if (!isSupabaseConfigured) {
    return EMPTY_LIFETIME_STATS;
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('session_date, completed, duration_minutes, tonnage_kg')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('session_date', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) {
      return EMPTY_LIFETIME_STATS;
    }
    throw error;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return EMPTY_LIFETIME_STATS;
  }

  const sessionDates = rows.map((row) => String(row.session_date));
  const { streakDays, longestStreakDays } = computeStreaks(sessionDates);

  const totalMinutes = rows.reduce((sum, row) => sum + Number(row.duration_minutes ?? 0), 0);
  const totalTonnageKg = rows.reduce((sum, row) => sum + Number(row.tonnage_kg ?? 0), 0);
  const personalRecordCount = await fetchPersonalRecordCount(userId);

  return {
    totalWorkouts: rows.length,
    streakDays,
    longestStreakDays,
    totalMinutes,
    totalTonnageKg,
    personalRecordCount,
  };
}
