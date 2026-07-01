import {
  FREE_MAX_CUSTOM_EXERCISES,
  FREE_MAX_CUSTOM_PROGRAMS,
  isProBuiltinProgram,
} from '../../constants/workoutFreeTier';
import type { WorkoutTrackId } from '../../types/workout';

export type WorkoutGateReason =
  | 'pro_program'
  | 'custom_program_limit'
  | 'custom_exercise_limit';

export function canAccessBuiltinProgram(trackId: WorkoutTrackId, isPro: boolean): boolean {
  if (isPro) return true;
  return !isProBuiltinProgram(trackId);
}

export function canCreateCustomProgram(currentCount: number, isPro: boolean): boolean {
  if (isPro) return true;
  return currentCount < FREE_MAX_CUSTOM_PROGRAMS;
}

export function canAddCustomExercise(currentCount: number, isPro: boolean): boolean {
  if (isPro) return true;
  return currentCount < FREE_MAX_CUSTOM_EXERCISES;
}

export function workoutGateFeature(reason: WorkoutGateReason) {
  switch (reason) {
    case 'pro_program':
      return 'pro_workout_programs' as const;
    case 'custom_program_limit':
      return 'custom_workout_programs' as const;
    case 'custom_exercise_limit':
      return 'custom_exercise_library' as const;
  }
}

export function workoutGateMessage(reason: WorkoutGateReason): string {
  switch (reason) {
    case 'pro_program':
      return 'This program is part of TrackIt Pro.';
    case 'custom_program_limit':
      return `Free includes ${FREE_MAX_CUSTOM_PROGRAMS} custom programs. Upgrade for unlimited programs.`;
    case 'custom_exercise_limit':
      return `Free includes ${FREE_MAX_CUSTOM_EXERCISES} custom exercises. Upgrade for a full library.`;
  }
}
