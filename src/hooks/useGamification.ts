import { useEffect } from 'react';

import { useGamificationStore } from '../stores/useGamificationStore';
import type { GamificationLeaderboardResult } from '../types/gamification';

let subscriberCount = 0;

export function useGamification() {
  const profile = useGamificationStore((s) => s.profile);
  const level = useGamificationStore((s) => s.level);
  const xp = useGamificationStore((s) => s.xp);
  const xpProgress = useGamificationStore((s) => s.xpProgress);
  const globalRank = useGamificationStore((s) => s.globalRank);
  const topUsers = useGamificationStore((s) => s.topUsers);
  const isLoading = useGamificationStore((s) => s.isLoading);
  const isAwardingXp = useGamificationStore((s) => s.isAwardingXp);
  const isUpdatingUsername = useGamificationStore((s) => s.isUpdatingUsername);
  const error = useGamificationStore((s) => s.error);
  const levelUpCelebration = useGamificationStore((s) => s.levelUpCelebration);

  const initialize = useGamificationStore((s) => s.initialize);
  const syncProfile = useGamificationStore((s) => s.syncProfile);
  const fetchGlobalLeaderboard = useGamificationStore((s) => s.fetchGlobalLeaderboard);
  const addXpAction = useGamificationStore((s) => s.addXpAction);
  const updateUsername = useGamificationStore((s) => s.updateUsername);
  const dismissLevelUp = useGamificationStore((s) => s.dismissLevelUp);
  const teardown = useGamificationStore((s) => s.teardown);

  useEffect(() => {
    subscriberCount += 1;

    if (subscriberCount === 1) {
      void initialize();
    }

    return () => {
      subscriberCount = Math.max(0, subscriberCount - 1);

      if (subscriberCount === 0) {
        teardown();
      }
    };
  }, [initialize, teardown]);

  return {
    profile,
    level,
    xp,
    xpProgress,
    globalRank,
    topUsers,
    isLoading,
    isAwardingXp,
    isUpdatingUsername,
    error,
    levelUpCelebration,
    syncProfile,
    fetchGlobalLeaderboard,
    addXpAction,
    updateUsername,
    dismissLevelUp,
  };
}

export type UseGamificationResult = ReturnType<typeof useGamification>;
export type { GamificationLeaderboardResult };
