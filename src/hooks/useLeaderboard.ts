import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  mapLeaderboardEntry,
  mapProfileRow,
  toErrorMessage,
  TOP_LIMIT,
  type CurrentUserLeaderboard,
  type LeaderboardEntry,
  type LeaderboardState,
  type ProfileStatsUpdate,
} from '../lib/leaderboardMappers';

type UseLeaderboardResult = LeaderboardState & {
  refresh: () => Promise<void>;
  updateCurrentUserStats: (patch: ProfileStatsUpdate) => Promise<void>;
};

async function fetchTopUsers(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank_position', { ascending: true })
    .limit(TOP_LIMIT);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapLeaderboardEntry(row as Record<string, unknown>));
}

async function resolveRankPosition(profile: {
  level: number;
  xp: number;
}): Promise<{ rankPosition: number; totalUsers: number }> {
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

  return {
    rankPosition: (higherRankCount ?? 0) + 1,
    totalUsers: totalUsers ?? 0,
  };
}

async function fetchCurrentUserContext(
  userId: string,
): Promise<CurrentUserLeaderboard | null> {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profileData) {
    return null;
  }

  const profile = mapProfileRow(profileData as Record<string, unknown>);
  const { rankPosition, totalUsers } = await resolveRankPosition(profile);

  const percentile =
    totalUsers > 0 ? Math.round(((totalUsers - rankPosition + 1) / totalUsers) * 100) : 100;

  return {
    profile: { ...profile },
    rank_position: rankPosition,
    percentile,
    total_users: totalUsers,
  };
}

export function useLeaderboard(): UseLeaderboardResult {
  const [state, setState] = useState<LeaderboardState>({
    topUsers: [],
    currentUser: null,
    isLoading: true,
    error: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setState({
        topUsers: [],
        currentUser: null,
        isLoading: false,
        error: 'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id ?? null;
      userIdRef.current = userId;

      const [topUsers, currentUser] = await Promise.all([
        fetchTopUsers(),
        userId ? fetchCurrentUserContext(userId) : Promise.resolve(null),
      ]);

      setState({
        topUsers,
        currentUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toErrorMessage(error),
      }));
    }
  }, []);

  const updateCurrentUserStats = useCallback(
    async (patch: ProfileStatsUpdate) => {
      const userId = userIdRef.current;
      if (!userId) {
        throw new Error('You must be signed in to update profile stats.');
      }

      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);

      if (error) {
        throw error;
      }

      await loadLeaderboard();
    },
    [loadLeaderboard],
  );

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined;
    }

    const channel = supabase
      .channel('leaderboard-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          void loadLeaderboard();
        },
      )
      .subscribe();

    channelRef.current = channel;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadLeaderboard();
    });

    return () => {
      subscription.unsubscribe();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadLeaderboard]);

  return {
    ...state,
    refresh: loadLeaderboard,
    updateCurrentUserStats,
  };
}
