import { useCallback, useEffect } from 'react';

import { emptyDashboardFinance } from '../lib/finance/dashboardFinance';
import { isSupabaseConfigured } from '../lib/supabase';
import { EMPTY_FINANCE } from '../stores/useDashboardStore';
import { useFinanceSyncStore } from '../stores/useFinanceSyncStore';
import { useGamificationStore } from '../stores/useGamificationStore';
import type { DashboardFinanceSnapshot } from '../types/dashboard';

export type UseDashboardFinanceResult = {
  finance: DashboardFinanceSnapshot;
  isLoading: boolean;
  isLive: boolean;
  refresh: () => Promise<void>;
};

export function useDashboardFinance(cardholder?: string): UseDashboardFinanceResult {
  const userId = useGamificationStore((s) => s.profile?.id);
  const username = useGamificationStore((s) => s.profile?.username);
  const resolvedCardholder = cardholder ?? username?.toUpperCase() ?? 'HUNTER';

  const finance = useFinanceSyncStore((s) => s.dashboard);
  const isLoading = useFinanceSyncStore((s) => s.isLoading);
  const isLive = useFinanceSyncStore((s) => s.isLive);
  const refreshStore = useFinanceSyncStore((s) => s.refresh);
  const ensureSubscribed = useFinanceSyncStore((s) => s.ensureSubscribed);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      useFinanceSyncStore.setState({
        dashboard: emptyDashboardFinance(resolvedCardholder),
        isLoading: false,
        isLive: false,
      });
      useGamificationStore.getState().setFinanceXpMultiplier(1);
      return;
    }

    await refreshStore(userId, resolvedCardholder);
  }, [refreshStore, resolvedCardholder, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    ensureSubscribed(userId);
    void refresh();
  }, [ensureSubscribed, refresh, userId]);

  return {
    finance: finance ?? EMPTY_FINANCE,
    isLoading,
    isLive,
    refresh,
  };
}
