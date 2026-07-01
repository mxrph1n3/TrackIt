import { useMemo } from 'react';

import { countCompletedExercises } from '../../lib/health/workoutEngine';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useHealthStore } from '../../stores/useHealthStore';

export type ActionHubCrystalState = {
  hasActiveWorkout: boolean;
  workoutProgress: number;
  hasOverdueDot: boolean;
  hasStreakGlow: boolean;
};

export function useActionHubCrystalState(): ActionHubCrystalState {
  const activeSession = useHealthStore((s) => s.activeSession);
  const streakDays = useHealthStore((s) => s.lifetimeStats.streakDays);
  const daysActive = useGamificationStore((s) => s.profile?.days_active ?? 0);
  const schedule = useDashboardStore((s) => s.schedule);

  return useMemo(() => {
    const hasActiveWorkout = Boolean(activeSession && !activeSession.completionSummary);
    let workoutProgress = 0;

    if (hasActiveWorkout && activeSession) {
      const completed = countCompletedExercises(activeSession.exercises);
      workoutProgress =
        activeSession.exercises.length > 0
          ? Math.round((completed / activeSession.exercises.length) * 100)
          : 0;
    }

    const incompleteTasks = schedule.filter((item) => !item.completed).length;
    const hasStreakGlow = Math.max(streakDays, daysActive) >= 3;

    return {
      hasActiveWorkout,
      workoutProgress,
      hasOverdueDot: incompleteTasks > 0 && !hasActiveWorkout,
      hasStreakGlow,
    };
  }, [activeSession, daysActive, schedule, streakDays]);
}
