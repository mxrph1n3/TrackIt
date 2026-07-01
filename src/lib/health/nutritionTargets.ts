import type { DietGoal, DietPlan } from '../../types/health';

export type NutritionGender = 'male' | 'female' | 'other';

export type NutritionProfileInput = {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: NutritionGender;
  activityFactor: number;
  dietGoal: DietGoal;
  goalPaceKg?: number;
};

export type NutritionTargets = {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterTargetMl: number;
  dietPlan: DietPlan;
};

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', factor: 1.2, label: 'Sedentary' },
  { id: 'light', factor: 1.375, label: 'Light activity' },
  { id: 'moderate', factor: 1.55, label: 'Moderate' },
  { id: 'active', factor: 1.725, label: 'Active' },
  { id: 'very_active', factor: 1.9, label: 'Very active' },
] as const;

const GOAL_LABELS: Record<DietGoal, string> = {
  fat_loss: 'Fat Loss Goal',
  maintenance: 'Maintenance Goal',
  bulk: 'Bulk Goal',
};

const MACRO_SPLITS: Record<DietGoal, { protein: number; fat: number; carbs: number }> = {
  fat_loss: { protein: 0.3, fat: 0.25, carbs: 0.45 },
  maintenance: { protein: 0.32, fat: 0.31, carbs: 0.37 },
  bulk: { protein: 0.24, fat: 0.3, carbs: 0.46 },
};

const DEFAULT_PROFILE: NutritionProfileInput = {
  weightKg: 78,
  heightCm: 175,
  age: 30,
  gender: 'male',
  activityFactor: 1.55,
  dietGoal: 'fat_loss',
  goalPaceKg: 0.5,
};

export function defaultGoalPaceKg(goal: DietGoal): number {
  if (goal === 'fat_loss') return 0.5;
  if (goal === 'bulk') return 0.25;
  return 0;
}

export function computeBmr(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: NutritionGender,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') return base - 161;
  if (gender === 'male') return base + 5;
  return base - 78;
}

export function computeTdee(bmr: number, activityFactor: number): number {
  const clampedFactor = Math.min(1.9, Math.max(1.2, activityFactor));
  return Math.round(bmr * clampedFactor);
}

export function computeCalorieTarget(
  tdee: number,
  dietGoal: DietGoal,
  goalPaceKg: number,
): number {
  const pace = Math.max(0, goalPaceKg);
  const dailyDelta = 1100 * pace;

  if (dietGoal === 'fat_loss') {
    return Math.max(1200, Math.round(tdee - dailyDelta));
  }
  if (dietGoal === 'bulk') {
    return Math.round(tdee + dailyDelta);
  }
  return Math.round(tdee);
}

export function computeMacroGrams(
  calorieTarget: number,
  dietGoal: DietGoal,
): { proteinG: number; fatG: number; carbsG: number } {
  const split = MACRO_SPLITS[dietGoal];
  return {
    proteinG: Math.round((calorieTarget * split.protein) / 4),
    fatG: Math.round((calorieTarget * split.fat) / 9),
    carbsG: Math.round((calorieTarget * split.carbs) / 4),
  };
}

/** Water target in ml: W×35 ml/kg + 500 ml per 30 min of workout. */
export function computeWaterTargetMl(weightKg: number, workoutMinutesToday = 0): number {
  const baseMl = Math.max(0, weightKg) * 35;
  const workoutBonusMl = Math.max(0, workoutMinutesToday) >= 30
    ? Math.floor(Math.max(0, workoutMinutesToday) / 30) * 500
    : 0;
  return Math.round(baseMl + workoutBonusMl);
}

export function buildNutritionTargets(
  input: Partial<NutritionProfileInput> = {},
  workoutMinutesToday = 0,
): NutritionTargets {
  const profile: NutritionProfileInput = {
    ...DEFAULT_PROFILE,
    ...input,
    goalPaceKg: input.goalPaceKg ?? defaultGoalPaceKg(input.dietGoal ?? DEFAULT_PROFILE.dietGoal),
  };

  const bmr = Math.round(computeBmr(profile.weightKg, profile.heightCm, profile.age, profile.gender));
  const tdee = computeTdee(bmr, profile.activityFactor);
  const calorieTarget = computeCalorieTarget(tdee, profile.dietGoal, profile.goalPaceKg ?? 0);
  const macros = computeMacroGrams(calorieTarget, profile.dietGoal);
  const waterTargetMl = computeWaterTargetMl(profile.weightKg, workoutMinutesToday);

  return {
    bmr,
    tdee,
    calorieTarget,
    ...macros,
    waterTargetMl,
    dietPlan: {
      goal: profile.dietGoal,
      calories: calorieTarget,
      protein_target: macros.proteinG,
      fat_target: macros.fatG,
      carb_target: macros.carbsG,
      label: GOAL_LABELS[profile.dietGoal],
    },
  };
}

export function buildDefaultDietPlan(): DietPlan {
  return buildNutritionTargets().dietPlan;
}
