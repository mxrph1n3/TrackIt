import { toDayKey } from '../../utils/plannerDates';
import { ACHIEVEMENT_DEFINITIONS, type AchievementDefinition } from '../../constants/achievements';
import type { UserAchievementRow } from '../../types/achievements';
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

function metricValue(metrics: AchievementMetrics, key: AchievementDefinition['metricKey']): number {
  switch (key) {
    case 'tasks_completed':
      return metrics.tasksCompleted;
    case 'habit_streak_days':
      return metrics.habitStreakDays;
    case 'focus_sessions':
      return metrics.focusSessions;
    case 'level_reached':
      return metrics.level;
    default:
      return 0;
  }
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

export async function syncAchievements(
  userId: string,
  metrics: AchievementMetrics,
): Promise<AchievementProgress[]> {
  const stored = await fetchUserAchievements(userId);
  const storedMap = new Map(stored.map((row) => [row.achievement_id, row]));

  const results: AchievementProgress[] = [];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    const progress = Math.min(metricValue(metrics, definition.metricKey), definition.targetValue);
    const existing = storedMap.get(definition.id);
    const unlocked = progress >= definition.targetValue;
    const unlockedAt = existing?.unlocked_at ?? (unlocked ? new Date().toISOString() : null);

    if (isSupabaseConfigured) {
      await supabase.from('user_achievements').upsert(
        {
          user_id: userId,
          achievement_id: definition.id,
          progress,
          unlocked_at: unlockedAt,
          xp_collected: existing?.xp_collected ?? false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,achievement_id' },
      );
    }

    results.push({
      ...definition,
      progress,
      unlocked: Boolean(unlockedAt),
      unlockedAt,
      xpCollected: existing?.xp_collected ?? false,
    });
  }

  return results;
}

export async function collectAchievementXp(
  userId: string,
  achievementId: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('user_achievements')
    .update({ xp_collected: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('achievement_id', achievementId);

  if (error) {
    throw error;
  }
}

export function countUncollectedXp(achievements: AchievementProgress[]): number {
  return achievements
    .filter((item) => item.unlocked && !item.xpCollected)
    .reduce((sum, item) => sum + item.xpReward, 0);
}
