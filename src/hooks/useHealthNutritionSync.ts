import { useEffect } from 'react';

import {
  fetchTodayNutrition,
  fetchTodayWorkoutCompleted,
} from '../lib/health/nutritionService';
import { resolveNutritionTargets } from '../lib/health/nutritionProfileService';
import { fetchLatestWeight } from '../lib/health/weightService';
import { fetchWorkoutLifetimeStats, mergeLifetimeStats } from '../lib/health/workoutStatsService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { useGamificationStore } from '../stores/useGamificationStore';
import type { ProfileRow } from '../types/database';
import { useHealthStore } from '../stores/useHealthStore';

export async function syncHealthNutritionState(
  userId: string,
  profile: ProfileRow | null,
): Promise<void> {
  const [nutrition, workoutCompleted, latestWeight, lifetimeStats] = await Promise.all([
    fetchTodayNutrition(userId),
    fetchTodayWorkoutCompleted(userId),
    fetchLatestWeight(userId),
    fetchWorkoutLifetimeStats(userId),
  ]);

  const weightKg = latestWeight ?? useHealthStore.getState().bodyStats.weightKg;
  const workoutMinutes =
    workoutCompleted && useHealthStore.getState().lastSession.relativeDay === 'Today'
      ? useHealthStore.getState().lastSession.durationMinutes
      : 0;

  useHealthStore.getState().applyNutritionTargets(
    resolveNutritionTargets(profile, weightKg, workoutMinutes),
  );
  useHealthStore.getState().hydrateNutrition(nutrition);
  useHealthStore.setState((state) => ({
    lifetimeStats: mergeLifetimeStats(state.lifetimeStats, lifetimeStats),
  }));

  if (latestWeight != null) {
    useHealthStore.setState((state) => ({
      bodyStats: {
        ...state.bodyStats,
        weightKg: latestWeight,
      },
    }));
  }

  if (workoutCompleted) {
    const state = useHealthStore.getState();
    if (state.lastSession.relativeDay !== 'Today') {
      useHealthStore.setState({
        lastSession: {
          ...state.lastSession,
          relativeDay: 'Today',
          title: state.todayFocusName || state.lastSession.title,
        },
      });
    }
  }
}

export function useHealthNutritionSync() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const profile = useGamificationStore((state) => state.profile);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    const hydrate = async () => {
      try {
        await syncHealthNutritionState(userId, profile);
      } catch (error) {
        reportSyncError('Health', error, 'Could not load nutrition data.');
      }
    };

    void hydrate();

    const channel = supabase
      .channel(`health-nutrition-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_nutrition_logs', filter: `user_id=eq.${userId}` },
        () => {
          void hydrate();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_sessions', filter: `user_id=eq.${userId}` },
        () => {
          void hydrate();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weight_logs', filter: `user_id=eq.${userId}` },
        () => {
          void hydrate();
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        () => {
          void hydrate();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exercise_prs', filter: `user_id=eq.${userId}` },
        () => {
          void hydrate();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile, userId]);
}

export function NutritionSyncBridge() {
  useHealthNutritionSync();
  return null;
}
