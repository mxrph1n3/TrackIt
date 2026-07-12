import { ACHIEVEMENT_DEFINITIONS, type AchievementDefinition } from '../../constants/achievements';
import type { UserAchievementRow } from '../../types/achievements';
import { toDayKey } from '../../utils/plannerDates';
import { isSupabaseConfigured, supabase } from '../supabase';

export type AchievementProgress = AchievementDefinition & {
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
  xpCollected: boolean;
};

export type AchievementMetrics = {
  tasksCompleted: number;
  habitStreakDays: number;
  focusSessions: number;
  level: number;
};

export type CollectAchievementResult = {
  leveledUp: boolean;
  newLevel: number;
  newXp: number;
  xpAwarded: number;
};

function mapRowToProgress(row: UserAchievementRow): AchievementProgress | null {
  const definition = ACHIEVEMENT_DEFINITIONS.find((item) => item.id === row.achievement_id);
  if (!definition) {
    return null;
  }

  return {
    ...definition,
    progress: row.progress,
    unlocked: Boolean(row.unlocked_at),
    unlockedAt: row.unlocked_at,
    xpCollected: row.xp_collected,
  };
}

export async function fetchAchievementMetrics(userId: string): Promise<AchievementMetrics> {
  if (!isSupabaseConfigured) {
    return { tasksCompleted: 0, habitStreakDays: 0, focusSessions: 0, level: 1 };
  }

  const [tasksResult, profileResult, focusResult, streakResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true),
    supabase.from('profiles').select('level').eq('id', userId).maybeSingle(),
    supabase
      .from('focus_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('session_type', 'focus'),
    supabase
      .from('habit_logs')
      .select('logged_on')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('logged_on', { ascending: false })
      .limit(60),
  ]);

  const tasksCompleted = tasksResult.count ?? 0;
  const level = Number(profileResult.data?.level ?? 1);
  const focusSessions = focusResult.count ?? 0;

  const dayKeys = new Set((streakResult.data ?? []).map((row) => String(row.logged_on)));
  let habitStreakDays = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  while (dayKeys.has(toDayKey(cursor))) {
    habitStreakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { tasksCompleted, habitStreakDays, focusSessions, level };
}

export async function fetchUserAchievements(userId: string): Promise<UserAchievementRow[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return [];
  }

  return (data ?? []) as UserAchievementRow[];
}

/** Server-side sync — metrics computed in Postgres, client cannot forge unlocks. */
export async function syncAchievements(userId: string): Promise<AchievementProgress[]> {
  if (!isSupabaseConfigured) {
    return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
      ...definition,
      progress: 0,
      unlocked: false,
      unlockedAt: null,
      xpCollected: false,
    }));
  }

  const { data, error } = await supabase.rpc('sync_user_achievements');

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as UserAchievementRow[];
  if (rows.length === 0) {
    return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
      ...definition,
      progress: 0,
      unlocked: false,
      unlockedAt: null,
      xpCollected: false,
    }));
  }

  return rows
    .map(mapRowToProgress)
    .filter((item): item is AchievementProgress => item != null)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function collectAchievementXp(
  _userId: string,
  achievementId: string,
): Promise<CollectAchievementResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.rpc('collect_achievement_reward', {
    p_achievement_id: achievementId,
  });

  if (error) {
    throw error;
  }

  const result = (data as CollectAchievementResult[] | null)?.[0];
  if (!result) {
    throw new Error('Could not collect achievement reward.');
  }

  return result;
}

export function countUncollectedXp(achievements: AchievementProgress[]): number {
  return achievements
    .filter((item) => item.unlocked && !item.xpCollected)
    .reduce((sum, item) => sum + item.xpReward, 0);
}
