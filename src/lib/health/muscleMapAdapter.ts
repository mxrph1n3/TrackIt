import type { MuscleGroup, MuscleMapValues } from '@musclemap/core';

import type { MuscleHighlight, MuscleId } from '../../types/workout';

/** TrackIt muscle ids → MuscleMap {@link MuscleGroup} keys. */
const MUSCLE_ID_TO_GROUPS: Partial<Record<MuscleId, MuscleGroup[]>> = {
  chest: ['CHEST'],
  lats: ['LATS'],
  trapezius: ['TRAPEZIUS'],
  lower_back: ['BACK_LOWER'],
  deltoids: ['SHOULDERS_FRONT', 'SHOULDERS_SIDE', 'SHOULDERS_REAR'],
  quadriceps: ['QUADS'],
  glutes: ['GLUTES'],
  hamstrings: ['HAMSTRINGS'],
  calves: ['CALVES'],
  biceps: ['BICEPS'],
  triceps: ['TRICEPS'],
  abs: ['CORE'],
  obliques: ['OBLIQUES'],
  core: ['CORE'],
  forearms: ['FOREARMS'],
  abs_anterior: ['CORE'],
};

export const TRACKIT_MUSCLE_COLOR = '#775DD8';
export const TRACKIT_MUSCLE_BASE_LIGHT = '#CBD5E1';
export const TRACKIT_MUSCLE_BASE_DARK = '#3D3654';
/** @deprecated Use TRACKIT_MUSCLE_BASE_LIGHT or theme-aware palette in MuscleMapBodyFigure */
export const TRACKIT_MUSCLE_BASE = TRACKIT_MUSCLE_BASE_LIGHT;
export const PRIMARY_MUSCLE_SCORE = 92;
export const SECONDARY_MUSCLE_SCORE = 48;

export function highlightToMuscleMapValues(highlight: MuscleHighlight): MuscleMapValues {
  const values: MuscleMapValues = {};

  for (const muscleId of highlight.primary) {
    for (const group of MUSCLE_ID_TO_GROUPS[muscleId] ?? []) {
      values[group] = { score: PRIMARY_MUSCLE_SCORE };
    }
  }

  for (const muscleId of highlight.secondary) {
    for (const group of MUSCLE_ID_TO_GROUPS[muscleId] ?? []) {
      if (!values[group]) {
        values[group] = { score: SECONDARY_MUSCLE_SCORE };
      }
    }
  }

  return values;
}

export function mergeHighlightsToValues(highlights: MuscleHighlight[]): MuscleMapValues {
  return highlightToMuscleMapValues({
    primary: highlights.flatMap((item) => item.primary),
    secondary: highlights.flatMap((item) => item.secondary),
  });
}
