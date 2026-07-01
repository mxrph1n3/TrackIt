import { create } from 'zustand';

import { fetchWaterTotalForDay } from '../lib/quickActions/service';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { useGamificationStore } from './useGamificationStore';

type WaterSyncState = {
  waterMl: number;
  isLoading: boolean;
  subscribedUserId: string | null;
  unsubscribeRealtime: (() => void) | null;
  ensureSubscribed: (userId: string) => void;
  refresh: (userId: string) => Promise<void>;
  addWaterOptimistic: (amountMl: number) => void;
};

export const useWaterSyncStore = create<WaterSyncState>((set, get) => ({
  waterMl: 0,
  isLoading: false,
  subscribedUserId: null,
  unsubscribeRealtime: null,

  ensureSubscribed: (userId: string) => {
    const state = get();
    if (state.subscribedUserId === userId && state.unsubscribeRealtime) {
      return;
    }

    state.unsubscribeRealtime?.();

    const unsubscribe = subscribePostgresChanges(
      `water-sync-${userId}`,
      [
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'water_logs',
            filter: `user_id=eq.${userId}`,
          },
        },
      ],
      () => {
        void get().refresh(userId);
      },
    );

    set({ subscribedUserId: userId, unsubscribeRealtime: unsubscribe });
  },

  refresh: async (userId: string) => {
    if (!isSupabaseConfigured) {
      set({ waterMl: 0, isLoading: false });
      return;
    }

    set((current) => ({
      isLoading: current.waterMl > 0 ? current.isLoading : true,
    }));

    try {
      const total = await fetchWaterTotalForDay(userId);
      set({ waterMl: total, isLoading: false });
    } catch (error) {
      reportSyncError('Health', error, 'Could not load water logs.');
      set({ isLoading: false });
    }
  },

  addWaterOptimistic: (amountMl: number) => {
    set((current) => ({ waterMl: current.waterMl + amountMl }));
  },
}));

export function refreshWaterForCurrentUser() {
  const userId = useGamificationStore.getState().profile?.id;
  if (!userId) {
    return;
  }

  void useWaterSyncStore.getState().refresh(userId);
}
