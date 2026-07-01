import type { ProgramExerciseTemplate } from '../../types/workout';
import type { WorkoutExercise, WorkoutSet } from '../../types/health';
import { calculateWorkoutXpFromTonnage, WORKOUT_XP_MIN } from '../gamification/xpFormulas';

export function templateToWorkoutExercise(
  template: ProgramExerciseTemplate,
  index: number,
): WorkoutExercise {
  const sets: WorkoutSet[] = Array.from({ length: template.setsCount }, (_, setIndex) => ({
    id: `s${setIndex + 1}`,
    weightKg: 0,
    reps: parseRepsHint(template.repsTarget),
    completed: false,
  }));

  return {
    id: `ex-${index}`,
    name: template.name,
    sets,
    template,
  };
}

export function buildExercisesFromDay(templates: ProgramExerciseTemplate[]): WorkoutExercise[] {
  return templates.map((template, index) => templateToWorkoutExercise(template, index));
}

function parseRepsHint(repsTarget: string): number {
  const match = repsTarget.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function markExerciseSetsComplete(exercise: WorkoutExercise): WorkoutExercise {
  const fallbackReps = parseRepsHint(exercise.template?.repsTarget ?? '0');

  return {
    ...exercise,
    sets: exercise.sets.map((set) => ({
      ...set,
      completed: true,
      reps: set.reps > 0 ? set.reps : fallbackReps,
    })),
  };
}

export function markExercisesCompleteThroughIndex(
  exercises: WorkoutExercise[],
  throughIndex: number,
): WorkoutExercise[] {
  return exercises.map((exercise, index) =>
    index <= throughIndex ? markExerciseSetsComplete(exercise) : exercise,
  );
}

export function formatExerciseSubtitle(template: ProgramExerciseTemplate): string {
  if (template.isCardio) {
    return `${template.cardioDurationMinutes ?? 0} min · zones ${(template.targetHeartRateZones ?? [1, 2]).join('–')}`;
  }
  const intensity = template.intensityPercentage ? `${template.intensityPercentage}% 1RM` : '';
  return intensity || template.repsTarget;
}

export function estimateDayDurationMinutes(exerciseCount: number): number {
  return Math.max(25, Math.round(exerciseCount * 4.2));
}

export function isExerciseComplete(exercise: WorkoutExercise): boolean {
  return exercise.sets.length > 0 && exercise.sets.every((set) => set.completed);
}

export function countCompletedExercises(exercises: WorkoutExercise[]): number {
  return exercises.filter(isExerciseComplete).length;
}

export function findNextIncompleteExerciseIndex(
  exercises: WorkoutExercise[],
  fromIndex = 0,
): number | null {
  for (let index = fromIndex; index < exercises.length; index += 1) {
    if (!isExerciseComplete(exercises[index])) return index;
  }
  for (let index = 0; index < fromIndex; index += 1) {
    if (!isExerciseComplete(exercises[index])) return index;
  }
  return null;
}

export type SessionStats = {
  exerciseCount: number;
  completedExerciseCount: number;
  setCount: number;
  completedSetCount: number;
  repCount: number;
  tonnageKg: number;
};

export function computeSessionStats(exercises: WorkoutExercise[]): SessionStats {
  return exercises.reduce<SessionStats>(
    (acc, exercise) => {
      const completedSets = exercise.sets.filter((set) => set.completed);
      return {
        exerciseCount: acc.exerciseCount + 1,
        completedExerciseCount:
          acc.completedExerciseCount + (isExerciseComplete(exercise) ? 1 : 0),
        setCount: acc.setCount + exercise.sets.length,
        completedSetCount: acc.completedSetCount + completedSets.length,
        repCount:
          acc.repCount +
          completedSets.reduce((sum, set) => sum + Math.max(set.reps, 0), 0),
        tonnageKg:
          acc.tonnageKg +
          completedSets.reduce(
            (sum, set) => sum + Math.max(set.weightKg, 0) * Math.max(set.reps, 0),
            0,
          ),
      };
    },
    {
      exerciseCount: 0,
      completedExerciseCount: 0,
      setCount: 0,
      completedSetCount: 0,
      repCount: 0,
      tonnageKg: 0,
    },
  );
}

export function computeWorkoutXp(stats: SessionStats, durationMinutes = 0): number {
  const fromSets = calculateWorkoutXpFromTonnage(stats.tonnageKg, stats.completedSetCount);
  if (fromSets > 0) {
    return fromSets;
  }

  if (stats.completedExerciseCount > 0 || durationMinutes >= 1) {
    return WORKOUT_XP_MIN;
  }

  return 0;
}

export function sessionDurationMinutes(
  startedAtMs: number | null,
  totalPausedMs = 0,
  isPaused = false,
  pausedAtMs: number | null = null,
): number {
  if (!startedAtMs) return 0;
  const pausedNow = isPaused && pausedAtMs ? Date.now() - pausedAtMs : 0;
  const elapsedMs = Date.now() - startedAtMs - totalPausedMs - pausedNow;
  return Math.max(1, Math.round(elapsedMs / 60_000));
}

export function sessionElapsedSeconds(
  startedAtMs: number,
  totalPausedMs = 0,
  isPaused = false,
  pausedAtMs: number | null = null,
): number {
  const pausedNow = isPaused && pausedAtMs ? Date.now() - pausedAtMs : 0;
  return Math.max(0, Math.floor((Date.now() - startedAtMs - totalPausedMs - pausedNow) / 1000));
}

export function estimateCaloriesBurned(durationMinutes: number, completedSets: number): number {
  return Math.round(durationMinutes * 6 + completedSets * 4);
}
