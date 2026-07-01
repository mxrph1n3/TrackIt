/** RPG-Fitness & nutrition domain types (food.md Level 2 + training.md). */

export type Cuisine = 'european' | 'italian' | 'asian' | 'fitness';
export type PricingTier = 'cheap' | 'mid' | 'premium';
export type DietGoal = 'fat_loss' | 'maintenance' | 'bulk';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'evening_snack';

export type QuickMealEntry = {
  name: string;
  calories: number;
};

export type QuickMealLog = Partial<Record<MealSlot, QuickMealEntry>>;

export type MealIngredient = {
  id: string;
  grams: number;
};

export type MealMacros = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

/** JSON-ready meal object from food.md §8 */
export type Meal = {
  meal_id: string;
  name: string;
  category: MealSlot;
  cuisine: Cuisine;
  tier: PricingTier;
  ingredients: MealIngredient[];
  macros: MealMacros;
  goal_tags: DietGoal[];
  prep_time: number;
  swap_ids: string[];
  /** Step-by-step preparation instructions. */
  instructions: string[];
};

export type DietPlan = {
  goal: DietGoal;
  calories: number;
  protein_target: number;
  fat_target: number;
  carb_target: number;
  label: string;
};

export type DayPlan = {
  dayKey: string;
  dayLabel: string;
  split: string;
  isToday: boolean;
  isRest: boolean;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  isUpcoming: boolean;
};

export type WorkoutSet = {
  id: string;
  weightKg: number;
  reps: number;
  completed: boolean;
};

import type { ProgramExerciseTemplate, WorkoutTrackId } from './workout';

export type WorkoutExercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
  template?: ProgramExerciseTemplate;
};

export type EnergyLevel = 'low' | 'medium' | 'high';

export type ActiveWorkoutSession = {
  trackId: WorkoutTrackId;
  title: string;
  focusName: string;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  startedAtMs: number;
  isPaused: boolean;
  pausedAtMs: number | null;
  totalPausedMs: number;
  completionSummary: WorkoutCompletionSummary | null;
};

export type WorkoutLifetimeStats = {
  totalWorkouts: number;
  streakDays: number;
  longestStreakDays: number;
  totalMinutes: number;
  totalTonnageKg: number;
  personalRecordCount: number;
};

export type WorkoutCompletionSummary = {
  focusName: string;
  programTitle: string;
  durationMinutes: number;
  xpEarned: number;
  levelUp: boolean;
  newLevel?: number;
  exerciseCount: number;
  completedExerciseCount: number;
  setCount: number;
  repCount: number;
  tonnageKg: number;
  newPrCount: number;
  newPrNames: string[];
  achievements: string[];
};

export type DailyMealLog = Record<MealSlot, string | null>;

export type MacroTotals = MealMacros;

export type BodyStats = {
  weightKg: number;
  progressPercent: number;
};

export type LastWorkoutSession = {
  title: string;
  relativeDay: string;
  durationMinutes: number;
  xpEarned: number;
  exerciseCount: number;
  setCount: number;
  tonnageKg: number;
};

export type HealthTabId = 'workouts' | 'nutrition';
