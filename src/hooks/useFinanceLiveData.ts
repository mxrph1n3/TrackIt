import { useCallback, useEffect } from 'react';

import { emptyFinanceOverview } from '../lib/finance/service';
import { isSupabaseConfigured } from '../lib/supabase';
import { useFinanceSyncStore } from '../stores/useFinanceSyncStore';
import { useGamificationStore } from '../stores/useGamificationStore';
import type { FinanceOverview } from '../types/finance';

export type UseFinanceLiveDataResult = {
  data: FinanceOverview;
  isLoading: boolean;
  isLive: boolean;
  refresh: () => Promise<void>;
};

export function useFinanceLiveData(): UseFinanceLiveDataResult {
  const userId = useGamificationStore((s) => s.profile?.id);
  const username = useGamificationStore((s) => s.profile?.username);
  const cardholder = username?.toUpperCase() ?? 'HUNTER';

  const data = useFinanceSyncStore((s) => s.overview);
  const isLoading = useFinanceSyncStore((s) => s.isLoading);
  const isLive = useFinanceSyncStore((s) => s.isLive);
  const refreshStore = useFinanceSyncStore((s) => s.refresh);
  const ensureSubscribed = useFinanceSyncStore((s) => s.ensureSubscribed);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      useFinanceSyncStore.setState({
        overview: emptyFinanceOverview(),
        isLoading: false,
        isLive: false,
      });
      return;
    }

    await refreshStore(userId, cardholder);
  }, [cardholder, refreshStore, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    ensureSubscribed(userId);
    void refresh();
  }, [ensureSubscribed, refresh, userId]);

  return {
    data: data ?? emptyFinanceOverview(),
    isLoading,
    isLive,
    refresh,
  };
}
