import type { LeaderboardEntry, ProfileRow } from '../../types/database';
import type {
  AddXpActionResult,
  GamificationLeaderboardResult,
  GlobalRankSnapshot,
} from '../../types/gamification';
import {
  mapLeaderboardEntry,
  mapProfileRow,
  toErrorMessage,
  TOP_LIMIT,
} from '../leaderboardMappers';
import { isSupabaseConfigured, supabase } from '../supabase';
import {
  getUserTierFromLevel,
  getXpProgress,
} from './progression';

const EMPTY_LEADERBOARD: GamificationLeaderboardResult = {
  topUsers: [],
  currentUserRank: null,
};

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function fetchCurrentProfile(userId: string): Promise<ProfileRow | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapProfileRow(data as Record<string, unknown>);
}

export async function resolveGlobalRank(
  profile: ProfileRow,
): Promise<GlobalRankSnapshot | null> {
  assertSupabaseConfigured();

  const [{ count: higherRankCount, error: rankError }, { count: totalUsers, error: totalError }] =
    await Promise.all([
      supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .or(`level.gt.${profile.level},and(level.eq.${profile.level},xp.gt.${profile.xp})`),
      supabase.from('leaderboard').select('*', { count: 'exact', head: true }),
    ]);

  if (rankError) {
    throw rankError;
  }
  if (totalError) {
    throw totalError;
  }

  const rankPosition = (higherRankCount ?? 0) + 1;
  const total = totalUsers ?? 0;
  const percentile =
    total > 0 ? Math.round(((total - rankPosition + 1) / total) * 100) : 100;
  const performanceTier = getUserTierFromLevel(profile.level);

  return {
    rankPosition,
    totalUsers: total,
    percentile,
    performanceTier,
    tierLabel: `${performanceTier} · Global rank #${rankPosition}`,
  };
}

export async function fetchGlobalLeaderboard(
  userId?: string | null,
): Promise<GamificationLeaderboardResult> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank_position', { ascending: true })
    .limit(TOP_LIMIT);

  if (error) {
    throw error;
  }

  const topUsers: LeaderboardEntry[] = (data ?? []).map((row, index) => ({
    ...mapProfileRow(row as Record<string, unknown>),
    rank_position: index + 1,
  }));

  if (!userId) {
    return { topUsers, currentUserRank: null };
  }

  const profile = await fetchCurrentProfile(userId);
  if (!profile) {
    return { topUsers, currentUserRank: null };
  }

  const currentUserRank = await resolveGlobalRank(profile);
  return { topUsers, currentUserRank };
}

export async function awardXpAndCheckLevel(
  userId: string,
  xpAmount: number,
  actionName: string,
): Promise<AddXpActionResult> {
  assertSupabaseConfigured();

  if (xpAmount <= 0) {
    throw new Error('XP amount must be greater than zero.');
  }

  const { data, error } = await supabase.rpc('award_xp_and_check_level', {
    user_id: userId,
    xp_amount: xpAmount,
    source_type: actionName,
  });

  if (error) {
    throw error;
  }

  const result = data?.[0];
  if (!result) {
    throw new Error(`Failed to award XP for ${actionName}.`);
  }

  return {
    leveledUp: result.leveled_up,
    newLevel: result.new_level,
    newXp: result.new_xp,
    actionName,
  };
}

export function buildGamificationSnapshot(
  profile: ProfileRow | null,
  globalRank: GlobalRankSnapshot | null,
) {
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;

  return {
    profile,
    level,
    xp,
    xpProgress: getXpProgress(level, xp),
    globalRank,
  };
}

export { toErrorMessage };
