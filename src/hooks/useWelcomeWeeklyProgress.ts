import { useCallback, useEffect, useState } from 'react';

import {
  fetchWeeklyProgressScores,
  type WeeklyProgressData,
} from '../lib/welcome/weeklyProgressService';
import { supabase } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import { buildCurrentWeek } from '../utils/plannerDates';

const SHORT_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

function buildEmptyWeek(): WeeklyProgressData {
  const week = buildCurrentWeek();
  return {
    days: week.map((day, index) => ({
      dayKey: day.key,
      shortLabel: SHORT_LABELS[index],
      score: 0,
      isToday: day.isToday,
    })),
    averagePercent: 0,
  };
}

export function useWelcomeWeeklyProgress() {
  const userId = useGamificationStore((s) => s.profile?.id);
  const [data, setData] = useState<WeeklyProgressData>(buildEmptyWeek);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      let resolvedUserId = userId;
      if (!resolvedUserId) {
        const { data: sessionData } = await supabase.auth.getSession();
        resolvedUserId = sessionData.session?.user?.id;
      }

      if (!resolvedUserId) {
        setData(buildEmptyWeek());
        return;
      }

      const weekly = await fetchWeeklyProgressScores(resolvedUserId);
      setData(weekly);
    } catch (error) {
      console.warn('[useWelcomeWeeklyProgress] refresh failed:', error);
      setData(buildEmptyWeek());
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      void refresh();
    }, 0);

    return () => clearTimeout(timer);
  }, [refresh]);

  return { data, isLoading, refresh };
}
