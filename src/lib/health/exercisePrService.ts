import type { WorkoutExercise } from '../../types/health';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export type SessionPrCandidate = {
  exerciseName: string;
  estimated1RmKg: number;
  bestWeightKg: number;
  bestReps: number;
};

export type SessionPrResult = {
  newPrCount: number;
  prNames: string[];
};

/** Epley formula from technical.md: 1RM = Weight × (1 + Reps/30). */
export function estimateEpley1Rm(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

export function extractSessionPrCandidates(exercises: WorkoutExercise[]): SessionPrCandidate[] {
  return exercises
    .map((exercise) => {
      let best1Rm = 0;
      let bestWeightKg = 0;
      let bestReps = 0;

      for (const set of exercise.sets) {
        if (!set.completed || set.weightKg <= 0 || set.reps <= 0) continue;
        const estimated = estimateEpley1Rm(set.weightKg, set.reps);
        if (estimated > best1Rm) {
          best1Rm = estimated;
          bestWeightKg = set.weightKg;
          bestReps = set.reps;
        }
      }

      if (best1Rm <= 0) return null;

      return {
        exerciseName: exercise.name,
        estimated1RmKg: Math.round(best1Rm * 10) / 10,
        bestWeightKg,
        bestReps,
      };
    })
    .filter((candidate): candidate is SessionPrCandidate => candidate != null);
}

export async function fetchPersonalRecordCount(userId: string): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0;
  }

  const { count, error } = await supabase
    .from('exercise_prs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    if (isMissingSchemaError(error)) {
      return 0;
    }
    throw error;
  }

  return count ?? 0;
}

export async function processWorkoutPersonalRecords(
  userId: string,
  exercises: WorkoutExercise[],
): Promise<SessionPrResult> {
  const candidates = extractSessionPrCandidates(exercises);
  if (!isSupabaseConfigured || candidates.length === 0) {
    return { newPrCount: 0, prNames: [] };
  }

  const names = candidates.map((candidate) => candidate.exerciseName);
  const { data: existingRows, error: fetchError } = await supabase
    .from('exercise_prs')
    .select('exercise_name, estimated_1rm_kg')
    .eq('user_id', userId)
    .in('exercise_name', names);

  if (fetchError) {
    if (isMissingSchemaError(fetchError)) {
      return { newPrCount: 0, prNames: [] };
    }
    throw fetchError;
  }

  const existingByName = new Map(
    (existingRows ?? []).map((row) => [String(row.exercise_name), Number(row.estimated_1rm_kg)]),
  );

  const prNames: string[] = [];
  const now = new Date().toISOString();

  for (const candidate of candidates) {
    const previousBest = existingByName.get(candidate.exerciseName) ?? 0;
    if (candidate.estimated1RmKg <= previousBest) continue;

    const { error: upsertError } = await supabase.from('exercise_prs').upsert(
      {
        user_id: userId,
        exercise_name: candidate.exerciseName,
        estimated_1rm_kg: candidate.estimated1RmKg,
        best_weight_kg: candidate.bestWeightKg,
        best_reps: candidate.bestReps,
        achieved_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id,exercise_name' },
    );

    if (upsertError) {
      if (isMissingSchemaError(upsertError)) {
        return { newPrCount: 0, prNames: [] };
      }
      throw upsertError;
    }

    prNames.push(candidate.exerciseName);
    existingByName.set(candidate.exerciseName, candidate.estimated1RmKg);
  }

  return { newPrCount: prNames.length, prNames };
}
