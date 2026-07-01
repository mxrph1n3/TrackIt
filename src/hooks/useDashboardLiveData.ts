import { useCallback, useEffect, useState } from 'react';

import { fetchTodayTasks, toggleTaskCompletion } from '../lib/dashboard/service';
import { syncHealthNutritionState } from './useHealthNutritionSync';
import {
  recordMonetizedTaskIncome,
  reverseMonetizedTaskIncome,
} from '../lib/finance/ecosystem';
import { subscribePostgresChanges } from '../lib/realtime/postgresSubscription';
import { isSupabaseConfigured } from '../lib/supabase';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { EMPTY_FINANCE } from '../stores/useDashboardStore';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useHealthStore } from '../stores/useHealthStore';
import { useTasksSyncStore } from '../stores/useTasksSyncStore';
import { useDashboardFinance } from './useDashboardFinance';
import { useDashboardMetrics } from './useDashboardMetrics';
import { useProgression } from './useProgression';
import type { ScheduleItem } from '../types/dashboard';
import type { MacroTotals } from '../types/health';

const DEFAULT_CALORIE_TARGET = 1700;
const DEFAULT_MACRO_TARGETS = {
  protein: 120,
  fat: 55,
  carbs: 160,
};

export type DashboardLiveData = {
  isLoading: boolean;
  isFreshUser: boolean;
  level: number;
  rank: string;
  xp: number;
  overallPercent: number;
  progress: ReturnType<typeof useDashboardMetrics>['progress'];
  schedule: ScheduleItem[];
  scheduleIsEmpty: boolean;
  focusStreakDays: number;
  focusCrystalActive: boolean;
  consumedMacros: MacroTotals;
  calorieTarget: number;
  macroTargets: typeof DEFAULT_MACRO_TARGETS;
  nutritionIsEmpty: boolean;
  finance: ReturnType<typeof useDashboardFinance>['finance'];
  refresh: () => Promise<void>;
  toggleScheduleItem: (id: string) => Promise<void>;
};

export function useDashboardLiveData(): DashboardLiveData {
  const { profile, level, rank, xp, syncProfile, awardXp, checkDailyStreakBonus } =
    useProgression();

  const {
    progress,
    overallPercent,
    refresh: refreshMetrics,
  } = useDashboardMetrics();

  const { finance, refresh: refreshFinance } = useDashboardFinance(
    profile?.username?.toUpperCase(),
  );

  const healthConsumed = useHealthStore((s) => s.consumedMacros);
  const dietPlan = useHealthStore((s) => s.dietPlan);
  const lastSession = useHealthStore((s) => s.lastSession);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const consumedMacros = healthConsumed;
  const workoutCompletedToday = lastSession.relativeDay === 'Today';
  const isFreshUser = level === 1 && xp === 0;
  const nutritionIsEmpty = consumedMacros.calories === 0;
  const focusStreakDays = Math.max(0, profile?.days_active ?? 0);
  const focusCrystalActive =
    focusStreakDays > 0 || Number(profile?.focus_hours ?? 0) > 0 || workoutCompletedToday;

  const refreshSchedule = useCallback(async () => {
    const userId = useGamificationStore.getState().profile?.id;
    if (!userId) {
      setSchedule([]);
      return;
    }

    try {
      const tasks = await fetchTodayTasks(userId);
      setSchedule(tasks);
      useDashboardStore.getState().setSchedule(tasks);
    } catch (error) {
      reportSyncError('Dashboard', error, 'Could not load today\'s schedule.');
      setSchedule([]);
      useDashboardStore.getState().setSchedule([]);
    }
  }, []);

  const tasksSyncVersion = useTasksSyncStore((s) => s.version);

  useEffect(() => {
    if (tasksSyncVersion === 0) {
      return;
    }

    void refreshSchedule();
  }, [refreshSchedule, tasksSyncVersion]);

  useEffect(() => {
    const userId = profile?.id;
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    return subscribePostgresChanges(
      `dashboard-tasks-${userId}`,
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
            table: 'task_subtasks',
            filter: `user_id=eq.${userId}`,
          },
        },
      ],
      () => {
        void refreshSchedule();
      },
    );
  }, [profile?.id, refreshSchedule]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const userId = useGamificationStore.getState().profile?.id;
      const profile = useGamificationStore.getState().profile;
      const nutritionRefresh =
        userId && isSupabaseConfigured
          ? syncHealthNutritionState(userId, profile).catch((error) => {
              reportSyncError('Dashboard', error, 'Could not refresh nutrition.');
            })
          : Promise.resolve();

      await Promise.all([
        syncProfile(),
        refreshMetrics(),
        refreshFinance(),
        refreshSchedule(),
        nutritionRefresh,
      ]);
    } catch (error) {
      reportSyncError('Dashboard', error, 'Could not refresh dashboard.');
      setSchedule([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFinance, refreshMetrics, refreshSchedule, syncProfile]);

  useEffect(() => {
    void refreshSchedule();
  }, [profile?.id, refreshSchedule]);

  const toggleScheduleItem = useCallback(
    async (id: string) => {
      const item = schedule.find((entry) => entry.id === id);
      if (!item) {
        return;
      }

      const nextCompleted = !item.completed;
      const nextSchedule = schedule.map((entry) =>
        entry.id === id ? { ...entry, completed: nextCompleted } : entry,
      );

      setSchedule(nextSchedule);
      useDashboardStore.getState().setSchedule(nextSchedule);

      try {
        await toggleTaskCompletion(id, nextCompleted);

        if (nextCompleted) {
          await recordMonetizedTaskIncome(id);
        } else {
          await reverseMonetizedTaskIncome(id);
        }

        await Promise.all([refreshMetrics(), refreshFinance()]);
        useTasksSyncStore.getState().notifyTaskMutation();
      } catch (error) {
        reportSyncError('Dashboard', error, 'Could not update the task.');
        setSchedule(schedule);
        useDashboardStore.getState().setSchedule(schedule);
        return;
      }

      if (nextCompleted) {
        await awardXp('TASK_COMPLETE');
        const completedCount = nextSchedule.filter((entry) => entry.completed).length;
        await checkDailyStreakBonus(completedCount, nextSchedule.length);
      }
    },
    [awardXp, checkDailyStreakBonus, refreshFinance, refreshMetrics, schedule],
  );

  return {
    isLoading: isRefreshing,
    isFreshUser,
    level,
    rank,
    xp,
    overallPercent,
    progress,
    schedule,
    scheduleIsEmpty: schedule.length === 0,
    focusStreakDays,
    focusCrystalActive,
    consumedMacros,
    calorieTarget: dietPlan.calories,
    macroTargets: {
      protein: dietPlan.protein_target,
      fat: dietPlan.fat_target,
      carbs: dietPlan.carb_target,
    },
    nutritionIsEmpty,
    finance: finance ?? EMPTY_FINANCE,
    refresh,
    toggleScheduleItem,
  };
}
