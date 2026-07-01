import { useCallback, useEffect, useRef, useState } from 'react';

import {
  emptyOverview,
  fetchStatisticsOverview,
  type StatisticsOverviewSnapshot,
} from '../lib/analytics/overviewService';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import { selectIsPro, useSubscriptionStore } from '../stores/useSubscriptionStore';
import { useMetricsSyncStore } from '../stores/useMetricsSyncStore';

export function useAnalyticsOverview() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const isPro = useSubscriptionStore(selectIsPro);
  const [data, setData] = useState<StatisticsOverviewSnapshot>(() => emptyOverview(isPro));
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setData(emptyOverview(isPro));
      setIsLive(false);
      setIsLoading(false);
      return;
    }

    setIsLoading((current) => (isLive ? current : true));

    try {
      const snapshot = await fetchStatisticsOverview(userId, { isPro });
      setData(snapshot);
      setIsLive(snapshot.isLive);
    } catch (error) {
      console.warn('[AnalyticsOverview] Failed to load overview:', error);
      setData(emptyOverview(isPro));
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLive, isPro, userId]);

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
      `analytics-overview-${userId}`,
      [
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
        },
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'habits',
            filter: `user_id=eq.${userId}`,
          },
        },
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'habit_logs',
            filter: `user_id=eq.${userId}`,
          },
        },
        {
          config: {
            event: '*',
            schema: 'public',
            table: 'workout_sessions',
            filter: `user_id=eq.${userId}`,
          },
        },
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
            table: 'transactions',
            filter: `user_id=eq.${userId}`,
          },
        },
      ],
      () => {
        void refreshRef.current();
      },
    );
  }, [userId]);

  const metricsSyncVersion = useMetricsSyncStore((state) => state.version);

  useEffect(() => {
    if (metricsSyncVersion === 0) {
      return;
    }

    void refreshRef.current();
  }, [metricsSyncVersion]);

  return {
    data,
    isLoading,
    isLive,
    refresh,
  };
}
