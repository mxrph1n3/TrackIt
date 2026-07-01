import { create } from 'zustand';

import { emptyDashboardFinance, fetchDashboardFinance } from '../lib/finance/dashboardFinance';
import { emptyFinanceOverview, fetchFinanceOverview } from '../lib/finance/service';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { EMPTY_FINANCE } from './useDashboardStore';
import { useGamificationStore } from './useGamificationStore';
import type { DashboardFinanceSnapshot } from '../types/dashboard';
import type { FinanceOverview } from '../types/finance';

const FINANCE_TABLES = [
  'transactions',
  'finance_accounts',
  'finance_goals',
  'finance_subscriptions',
  'budgets',
] as const;

type FinanceSyncState = {
  dashboard: DashboardFinanceSnapshot;
  overview: FinanceOverview;
  isLoading: boolean;
  isLive: boolean;
  subscribedUserId: string | null;
  unsubscribeRealtime: (() => void) | null;
  ensureSubscribed: (userId: string) => void;
  refresh: (userId: string, cardholder: string) => Promise<void>;
};

export const useFinanceSyncStore = create<FinanceSyncState>((set, get) => ({
  dashboard: EMPTY_FINANCE,
  overview: emptyFinanceOverview(),
  isLoading: false,
  isLive: false,
  subscribedUserId: null,
  unsubscribeRealtime: null,

  ensureSubscribed: (userId: string) => {
    const state = get();
    if (state.subscribedUserId === userId && state.unsubscribeRealtime) {
      return;
    }

    state.unsubscribeRealtime?.();

    const unsubscribe = subscribePostgresChanges(
      `finance-sync-${userId}`,
      FINANCE_TABLES.map((table) => ({
        config: {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
      })),
      () => {
        const cardholder =
          useGamificationStore.getState().profile?.username?.toUpperCase() ?? 'HUNTER';
        void get().refresh(userId, cardholder);
      },
    );

    set({ subscribedUserId: userId, unsubscribeRealtime: unsubscribe });
  },

  refresh: async (userId: string, cardholder: string) => {
    if (!isSupabaseConfigured) {
      set({
        dashboard: emptyDashboardFinance(cardholder),
        overview: emptyFinanceOverview(),
        isLoading: false,
        isLive: false,
      });
      useGamificationStore.getState().setFinanceXpMultiplier(1);
      return;
    }

    set((current) => ({
      isLoading: current.isLive ? current.isLoading : true,
    }));

    try {
      const [dashboard, overview] = await Promise.all([
        fetchDashboardFinance(userId, cardholder),
        fetchFinanceOverview(userId),
      ]);

      useGamificationStore.getState().setFinanceXpMultiplier(overview.financeXpMultiplier);

      set({
        dashboard,
        overview,
        isLoading: false,
        isLive: true,
      });
    } catch (error) {
      reportSyncError('Finance', error, 'Could not sync finance data.');
      set({
        dashboard: emptyDashboardFinance(cardholder),
        overview: emptyFinanceOverview(),
        isLoading: false,
        isLive: false,
      });
    }
  },
}));
