import { useCallback, useEffect, useState } from 'react';

import {
  collectAchievementXp,
  countUncollectedXp,
  fetchAchievementMetrics,
  syncAchievements,
  type AchievementProgress,
} from '../lib/achievements/service';
import { reportSyncError, reportSyncSuccess } from '../lib/sync/reportSyncError';
import { useProgression } from './useProgression';
import { isSupabaseConfigured } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useProfileStore } from '../stores/useProfileStore';

export function useAchievements() {
  const userId = useGamificationStore((s) => s.profile?.id);
  const { addXpAction } = useProgression();
  const setUncollectedXp = useProfileStore((s) => s.setUncollectedXpRewards);

  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setAchievements([]);
      setUncollectedXp(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const metrics = await fetchAchievementMetrics(userId);
      const synced = await syncAchievements(userId, metrics);
      setAchievements(synced);
      setUncollectedXp(countUncollectedXp(synced));
    } catch (error) {
      reportSyncError('Achievements', error, 'Could not load achievements.');
    } finally {
      setIsLoading(false);
    }
  }, [setUncollectedXp, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const collectReward = useCallback(
    async (achievementId: string) => {
      if (!userId) {
        return;
      }

      const achievement = achievements.find((item) => item.id === achievementId);
      if (!achievement?.unlocked || achievement.xpCollected) {
        return;
      }

      try {
        await collectAchievementXp(userId, achievementId);
        await addXpAction(achievement.xpReward, `achievement_${achievementId}`);
        await refresh();
        reportSyncSuccess('Reward collected.');
      } catch (error) {
        reportSyncError('Achievements', error, 'Could not collect reward.');
      }
    },
    [achievements, addXpAction, refresh, userId],
  );

  const selected = achievements.find((item) => item.id === selectedId) ?? null;

  return {
    achievements,
    isLoading,
    selected,
    setSelectedId,
    collectReward,
    refresh,
  };
}
