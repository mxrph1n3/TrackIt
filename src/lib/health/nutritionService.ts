import { getMealById, getMealLibrary, hasMealId } from '../../constants/meals';
import type { DailyMealLog, MealSlot, QuickMealEntry, QuickMealLog } from '../../types/health';
import { MEAL_SLOT_ORDER } from '../../constants/mealSlots';
import { toDayKey } from '../../utils/plannerDates';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

const MEAL_SLOTS: MealSlot[] = MEAL_SLOT_ORDER;

export type NutritionDaySnapshot = {
  mealLog: DailyMealLog;
  quickMeals: QuickMealLog;
  calorieTarget: number;
  caloriesConsumed: number;
};

export const EMPTY_MEAL_LOG: DailyMealLog = {
  breakfast: null,
  lunch: null,
  dinner: null,
  snack: null,
  evening_snack: null,
};

function emptySnapshot(): NutritionDaySnapshot {
  return {
    mealLog: { ...EMPTY_MEAL_LOG },
    quickMeals: {},
    calorieTarget: 1700,
    caloriesConsumed: 0,
  };
}

function normalizeMealLog(raw: unknown): DailyMealLog {
  const mealLog: DailyMealLog = { ...EMPTY_MEAL_LOG };
  if (!raw || typeof raw !== 'object') {
    return mealLog;
  }

  for (const slot of MEAL_SLOTS) {
    const value = (raw as Record<string, unknown>)[slot];
    if (typeof value === 'string' && hasMealId(value)) {
      mealLog[slot] = value;
    }
  }

  return mealLog;
}

function normalizeQuickMeals(raw: unknown): QuickMealLog {
  const quickMeals: QuickMealLog = {};
  if (!raw || typeof raw !== 'object') {
    return quickMeals;
  }

  for (const slot of MEAL_SLOTS) {
    const value = (raw as Record<string, unknown>)[slot];
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    const calories = Math.round(Number(entry.calories ?? 0));
    if (name && calories > 0) {
      quickMeals[slot] = { name, calories };
    }
  }

  return quickMeals;
}

export function sumNutritionCalories(mealLog: DailyMealLog, quickMeals: QuickMealLog): number {
  const catalogCalories = MEAL_SLOTS.reduce((sum, slot) => {
    const mealId = mealLog[slot];
    if (!mealId) return sum;
    return sum + (getMealById(mealId)?.macros.calories ?? 0);
  }, 0);

  const quickCalories = MEAL_SLOTS.reduce((sum, slot) => {
    return sum + (quickMeals[slot]?.calories ?? 0);
  }, 0);

  return catalogCalories + quickCalories;
}

export async function fetchTodayNutrition(
  userId: string,
  dayKey = toDayKey(new Date()),
): Promise<NutritionDaySnapshot> {
  if (!isSupabaseConfigured) {
    return emptySnapshot();
  }

  const { data, error } = await supabase
    .from('daily_nutrition_logs')
    .select('calories_consumed, calorie_target, meal_slots, quick_meals')
    .eq('user_id', userId)
    .eq('log_date', dayKey)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return emptySnapshot();
    }
    throw error;
  }

  if (!data) {
    return emptySnapshot();
  }

  const row = data as {
    calories_consumed: number;
    calorie_target: number;
    meal_slots?: unknown;
    quick_meals?: unknown;
  };

  const mealLog = normalizeMealLog(row.meal_slots);
  const quickMeals = normalizeQuickMeals(row.quick_meals);
  const computedCalories = sumNutritionCalories(mealLog, quickMeals);
  const storedCalories = Math.round(Number(row.calories_consumed ?? 0));

  return {
    mealLog,
    quickMeals,
    calorieTarget: Math.round(Number(row.calorie_target ?? 1700)),
    caloriesConsumed: Math.max(computedCalories, storedCalories),
  };
}

export async function persistTodayNutrition(
  userId: string,
  snapshot: NutritionDaySnapshot,
  dayKey = toDayKey(new Date()),
): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const computedCalories = sumNutritionCalories(snapshot.mealLog, snapshot.quickMeals);
  const caloriesConsumed = Math.max(computedCalories, Math.round(snapshot.caloriesConsumed));

  const payload = {
    user_id: userId,
    log_date: dayKey,
    calories_consumed: caloriesConsumed,
    calorie_target: snapshot.calorieTarget,
    meal_slots: snapshot.mealLog,
    quick_meals: snapshot.quickMeals,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('daily_nutrition_logs').upsert(payload, {
    onConflict: 'user_id,log_date',
  });

  if (error && !isMissingSchemaError(error)) {
    console.warn('[NutritionService] Failed to persist nutrition log:', error.message);
  }
}

export async function appendQuickMeal(
  userId: string,
  slot: MealSlot,
  name: string,
  calories: number,
  dayKey = toDayKey(new Date()),
): Promise<NutritionDaySnapshot> {
  const current = await fetchTodayNutrition(userId, dayKey);
  const quickMeals: QuickMealLog = {
    ...current.quickMeals,
    [slot]: { name, calories },
  };

  const next: NutritionDaySnapshot = {
    ...current,
    quickMeals,
    caloriesConsumed: sumNutritionCalories(current.mealLog, quickMeals),
  };

  await persistTodayNutrition(userId, next, dayKey);
  return next;
}

export async function fetchTodayWorkoutCompleted(
  userId: string,
  dayKey = toDayKey(new Date()),
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('completed')
    .eq('user_id', userId)
    .eq('session_date', dayKey)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return false;
    }
    throw error;
  }

  return data?.completed === true;
}
