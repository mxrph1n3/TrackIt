import { useCallback } from 'react';

import {
  canAccessBuiltinProgram,
  canAddCustomExercise,
  canCreateCustomProgram,
  workoutGateFeature,
  type WorkoutGateReason,
} from '../lib/subscription/workoutGating';
import { usePaywallStore } from '../stores/usePaywallStore';
import { selectIsPro, useSubscriptionStore } from '../stores/useSubscriptionStore';
import { useWorkoutLibraryStore } from '../stores/useWorkoutLibraryStore';
import type { WorkoutTrackId } from '../types/workout';

export function useWorkoutProgramAccess() {
  const isPro = useSubscriptionStore(selectIsPro);
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const customPrograms = useWorkoutLibraryStore((s) => s.customPrograms);
  const customExercises = useWorkoutLibraryStore((s) => s.customExercises);

  const openGate = useCallback(
    (reason: WorkoutGateReason) => {
      openPaywall(workoutGateFeature(reason));
    },
    [openPaywall],
  );

  const trySelectBuiltinProgram = useCallback(
    (trackId: WorkoutTrackId, onAllowed: () => void) => {
      if (canAccessBuiltinProgram(trackId, isPro)) {
        onAllowed();
        return true;
      }
      openGate('pro_program');
      return false;
    },
    [isPro, openGate],
  );

  const tryCreateCustomProgram = useCallback(
    (onAllowed: () => void) => {
      if (canCreateCustomProgram(customPrograms.length, isPro)) {
        onAllowed();
        return true;
      }
      openGate('custom_program_limit');
      return false;
    },
    [customPrograms.length, isPro, openGate],
  );

  const tryAddCustomExercise = useCallback(
    (onAllowed: () => void) => {
      if (canAddCustomExercise(customExercises.length, isPro)) {
        onAllowed();
        return true;
      }
      openGate('custom_exercise_limit');
      return false;
    },
    [customExercises.length, isPro, openGate],
  );

  return {
    isPro,
    trySelectBuiltinProgram,
    tryCreateCustomProgram,
    tryAddCustomExercise,
    isProProgram: (trackId: WorkoutTrackId) => !canAccessBuiltinProgram(trackId, isPro),
  };
}
