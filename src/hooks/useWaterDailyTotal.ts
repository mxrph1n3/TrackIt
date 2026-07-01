import { useCallback, useEffect } from 'react';

import { isSupabaseConfigured } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useWaterSyncStore } from '../stores/useWaterSyncStore';

export function useWaterDailyTotal() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const waterMl = useWaterSyncStore((state) => state.waterMl);
  const isLoading = useWaterSyncStore((state) => state.isLoading);
  const refreshStore = useWaterSyncStore((state) => state.refresh);
  const ensureSubscribed = useWaterSyncStore((state) => state.ensureSubscribed);
  const addWaterOptimistic = useWaterSyncStore((state) => state.addWaterOptimistic);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      useWaterSyncStore.setState({ waterMl: 0, isLoading: false });
      return;
    }

    await refreshStore(userId);
  }, [refreshStore, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    ensureSubscribed(userId);
    void refresh();
  }, [ensureSubscribed, refresh, userId]);

  return {
    waterMl,
    isLoading,
    refresh,
    addWaterOptimistic,
  };
}
