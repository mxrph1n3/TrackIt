import type { DietGoal } from '../../types/health';
import type { ProfileRow } from '../../types/database';
import {
  ACTIVITY_LEVELS,
  buildNutritionTargets,
  defaultGoalPaceKg,
  type NutritionGender,
  type NutritionProfileInput,
  type NutritionTargets,
} from './nutritionTargets';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export type NutritionProfileUpdate = Partial<{
  heightCm: number;
  age: number;
  gender: NutritionGender;
  activityFactor: number;
  dietGoal: DietGoal;
  goalPaceKg: number;
}>;

function parseGender(value: unknown): NutritionGender {
  if (value === 'female' || value === 'other') return value;
  return 'male';
}

function parseDietGoal(value: unknown): DietGoal {
  if (value === 'maintenance' || value === 'bulk') return value;
  return 'fat_loss';
}

export function nutritionProfileFromRow(
  profile: ProfileRow | null,
  weightKg: number,
): NutritionProfileInput {
  return {
    weightKg: weightKg > 0 ? weightKg : 78,
    heightCm: profile?.height_cm ?? 175,
    age: profile?.age ?? 30,
    gender: parseGender(profile?.gender),
    activityFactor: profile?.activity_factor ?? 1.55,
    dietGoal: parseDietGoal(profile?.diet_goal),
    goalPaceKg: profile?.goal_pace_kg ?? defaultGoalPaceKg(parseDietGoal(profile?.diet_goal)),
  };
}

export function resolveNutritionTargets(
  profile: ProfileRow | null,
  weightKg: number,
  workoutMinutesToday = 0,
): NutritionTargets {
  return buildNutritionTargets(nutritionProfileFromRow(profile, weightKg), workoutMinutesToday);
}

export async function updateNutritionProfile(
  userId: string,
  update: NutritionProfileUpdate,
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const payload: Partial<ProfileRow> = {};
  if (update.heightCm != null) payload.height_cm = Math.round(update.heightCm);
  if (update.age != null) payload.age = Math.round(update.age);
  if (update.gender != null) payload.gender = update.gender;
  if (update.activityFactor != null) payload.activity_factor = update.activityFactor;
  if (update.dietGoal != null) payload.diet_goal = update.dietGoal;
  if (update.goalPaceKg != null) payload.goal_pace_kg = update.goalPaceKg;

  if (Object.keys(payload).length === 0) {
    return;
  }

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) {
    if (isMissingSchemaError(error)) {
      return;
    }
    throw error;
  }
}

export { ACTIVITY_LEVELS };
