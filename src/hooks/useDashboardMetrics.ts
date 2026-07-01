import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  DEFAULT_CALORIE_TARGET,
  fetchDashboardMetricsRaw,
} from '../lib/dashboard/metricsService';
import {
  calculateDashboardProgress,
  EMPTY_DASHBOARD_METRICS_RAW,
} from '../lib/dashboard/metrics';
import type { DashboardMetricsRaw } from '../lib/dashboard/metrics';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useHealthStore } from '../stores/useHealthStore';
import { useMetricsSyncStore } from '../stores/useMetricsSyncStore';
import type { DashboardProgress } from '../types/dashboard';

export type UseDashboardMetricsResult = {
  progress: DashboardProgress;
  overallPercent: number;
  isLoading: boolean;
  isLive: boolean;
  refresh: () => Promise<void>;
};

export function useDashboardMetrics(): UseDashboardMetricsResult {
  const userId = useGamificationStore((s) => s.profile?.id);
  const consumedCalories = useHealthStore((s) => s.consumedMacros.calories);
  const calorieTarget = useHealthStore((s) => s.dietPlan.calories);
  const workoutCompletedToday = useHealthStore((s) => s.lastSession.relativeDay === 'Today');

  const [rawMetrics, setRawMetrics] = useState<DashboardMetricsRaw>(EMPTY_DASHBOARD_METRICS_RAW);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setRawMetrics({
        ...EMPTY_DASHBOARD_METRICS_RAW,
        consumedCalories,
        calorieTarget: calorieTarget || DEFAULT_CALORIE_TARGET,
        workoutCompletedToday,
      });
      setIsLive(false);
      setIsLoading(false);
      return;
    }

    setIsLoading((current) => (isLive ? current : true));

    try {
      const fetched = await fetchDashboardMetricsRaw(userId, {
        consumedCalories,
        calorieTarget: calorieTarget || DEFAULT_CALORIE_TARGET,
        workoutCompletedToday,
      });
      setRawMetrics(fetched);
      setIsLive(true);
    } catch (error) {
      console.warn('[DashboardMetrics] Using zero-state metrics:', error);
      setRawMetrics({
        ...EMPTY_DASHBOARD_METRICS_RAW,
        consumedCalories,
        calorieTarget: calorieTarget || DEFAULT_CALORIE_TARGET,
        workoutCompletedToday,
      });
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, [calorieTarget, consumedCalories, isLive, userId, workoutCompletedToday]);

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
      `dashboard-metrics-${userId}`,
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
            table: 'habit_logs',
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
            table: 'focus_sessions',
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

  const progress = useMemo(() => calculateDashboardProgress(rawMetrics), [rawMetrics]);

  return {
    progress,
    overallPercent: progress.overall,
    isLoading,
    isLive,
    refresh,
  };
}
