import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { useProgression } from './useProgression';
import { triggerHaptic } from '../lib/platform/haptics';
import {
  createHabit,
  fetchHabitsWithWeek,
  toggleHabitLog,
  type HabitWithWeek,
} from '../lib/habits/service';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { reportSyncError, reportSyncSuccess } from '../lib/sync/reportSyncError';
import { useGamificationStore } from '../stores/useGamificationStore';

export type UseHabitsResult = {
  habits: HabitWithWeek[];
  isLoading: boolean;
  isMutating: boolean;
  refresh: () => Promise<void>;
  toggleDay: (habitId: string, dayKey: string, nextCompleted: boolean) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
};

let habitsChannel: RealtimeChannel | null = null;

export function useHabits(): UseHabitsResult {
  const userId = useGamificationStore((s) => s.profile?.id);
  const syncProfile = useGamificationStore((s) => s.syncProfile);
  const { awardHabitCompletion } = useProgression();

  const [habits, setHabits] = useState<HabitWithWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchHabitsWithWeek(userId);
      setHabits(data);
    } catch (error) {
      reportSyncError('Habits', error, 'Could not load habits.');
      setHabits([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    if (habitsChannel) {
      void supabase.removeChannel(habitsChannel);
      habitsChannel = null;
    }

    habitsChannel = supabase
      .channel(`habits:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      if (habitsChannel) {
        void supabase.removeChannel(habitsChannel);
        habitsChannel = null;
      }
    };
  }, [refresh, userId]);

  const toggleDay = useCallback(
    async (habitId: string, dayKey: string, nextCompleted: boolean) => {
      if (!userId) {
        return;
      }

      setIsMutating(true);

      try {
        await toggleHabitLog(userId, habitId, dayKey, nextCompleted);

        if (nextCompleted) {
          void triggerHaptic('medium');
          await awardHabitCompletion(userId, habitId);
          await syncProfile();
        }

        await refresh();
        if (nextCompleted) {
          reportSyncSuccess('Habit logged.');
        }
      } catch (error) {
        reportSyncError('Habits', error, 'Could not update habit.');
      } finally {
        setIsMutating(false);
      }
    },
    [awardHabitCompletion, refresh, syncProfile, userId],
  );

  const addHabit = useCallback(
    async (title: string) => {
      if (!userId) {
        return;
      }

      setIsMutating(true);

      try {
        await createHabit(userId, title);
        await refresh();
        reportSyncSuccess('Habit created.');
      } catch (error) {
        reportSyncError('Habits', error, 'Could not create habit.');
      } finally {
        setIsMutating(false);
      }
    },
    [refresh, userId],
  );

  return {
    habits,
    isLoading,
    isMutating,
    refresh,
    toggleDay,
    addHabit,
  };
}
