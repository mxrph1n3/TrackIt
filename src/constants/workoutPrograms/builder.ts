import { resolveMusclesForExercise } from '../../lib/health/muscleMap';
import type { ProgramDay, ProgramExerciseTemplate } from '../../types/workout';

export function ex(
  name: string,
  sets: number,
  reps: string,
  opts?: Partial<ProgramExerciseTemplate>,
): ProgramExerciseTemplate {
  const muscles = resolveMusclesForExercise(name);
  return {
    name,
    setsCount: sets,
    repsTarget: reps,
    restSeconds: opts?.isCardio ? 0 : (opts?.restSeconds ?? 90),
    intensityPercentage: opts?.intensityPercentage ?? 70,
    primaryMuscles: opts?.primaryMuscles ?? muscles.primary,
    secondaryMuscles: opts?.secondaryMuscles ?? muscles.secondary,
    ...opts,
  };
}

export function warmup(minutes = 12): ProgramExerciseTemplate {
  return ex('Full Body Warm-up', 1, `${minutes} min`, {
    isCardio: true,
    cardioDurationMinutes: minutes,
    targetHeartRateZones: [1, 2],
    primaryMuscles: ['core'],
    secondaryMuscles: ['quadriceps'],
  });
}

export function cardioBlock(
  minutes: number,
  label: string,
  zones: number[] = [1, 2],
): ProgramExerciseTemplate {
  return ex(`Cardio — ${label}`, 1, `${minutes} min`, {
    isCardio: true,
    cardioDurationMinutes: minutes,
    cardioNotes: label,
    targetHeartRateZones: zones,
    primaryMuscles: ['core'],
    secondaryMuscles: ['quadriceps', 'calves'],
  });
}

export function day(
  weekNumber: number,
  dayNumber: number,
  focusName: string,
  exercises: ProgramExerciseTemplate[],
  notes?: string[],
): ProgramDay {
  return { weekNumber, dayNumber, focusName, exercises, notes };
}

export const MAINTENANCE_NOTES = [
  'Use weight around 70% of your one-rep max.',
  'Rest between sets: 90–120 seconds.',
  'If you experience significant muscle soreness, postpone the workout and allow muscles to recover.',
];
