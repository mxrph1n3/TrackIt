import { useCallback, useEffect, useRef, useState } from 'react';

import {
  emptyHealth,
  fetchHealthAnalytics,
  type HealthAnalyticsSnapshot,
} from '../lib/analytics/healthService';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';

export function useAnalyticsHealth() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const [data, setData] = useState<HealthAnalyticsSnapshot>(() => emptyHealth());
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setData(emptyHealth());
      setIsLive(false);
      setIsLoading(false);
      return;
    }

    setIsLoading((current) => (isLive ? current : true));

    try {
      const snapshot = await fetchHealthAnalytics(userId);
      setData(snapshot);
      setIsLive(snapshot.isLive);
    } catch (error) {
      console.warn('[AnalyticsHealth] Failed to load:', error);
      setData(emptyHealth());
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
      `analytics-health-${userId}`,
      [
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'daily_nutrition_logs',
            filter: `user_id=eq.${userId}`,
          },
        },
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'weight_logs',
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
