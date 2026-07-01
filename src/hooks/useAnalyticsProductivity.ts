import { useCallback, useEffect, useRef, useState } from 'react';

import {
  emptyProductivity,
  fetchProductivityAnalytics,
  type ProductivityAnalyticsSnapshot,
} from '../lib/analytics/productivityService';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';

export function useAnalyticsProductivity() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const [data, setData] = useState<ProductivityAnalyticsSnapshot>(() => emptyProductivity());
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setData(emptyProductivity());
      setIsLive(false);
      setIsLoading(false);
      return;
    }

    setIsLoading((current) => (isLive ? current : true));

    try {
      const snapshot = await fetchProductivityAnalytics(userId);
      setData(snapshot);
      setIsLive(snapshot.isLive);
    } catch (error) {
      console.warn('[AnalyticsProductivity] Failed to load:', error);
      setData(emptyProductivity());
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLive, userId]);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    return subscribePostgresChanges(
      `analytics-productivity-${userId}`,
      [
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'focus_sessions',
            filter: `user_id=eq.${userId}`,
          },
        },
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
        },
      ],
      () => {
        void refreshRef.current();
      },
    );
  }, [userId]);

  return { data, isLoading, isLive, refresh };
}
