import { useMemo } from 'react';

import { EMPTY_MEAL_LOG } from '../lib/health/nutritionService';
import { useHealthStore } from '../stores/useHealthStore';
import type { DailyMealLog, MacroTotals, QuickMealLog } from '../types/health';
import { useCalendarDayKey } from './useCalendarDayKey';

const EMPTY_MACROS: MacroTotals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
const EMPTY_QUICK_MEALS: QuickMealLog = {};

/** Nutrition scoped to the current local calendar day — never shows yesterday's meals/calories. */
export function useTodayNutrition() {
  const calendarDayKey = useCalendarDayKey();
  const nutritionDayKey = useHealthStore((s) => s.nutritionDayKey);
  const mealLog = useHealthStore((s) => s.mealLog);
  const quickMeals = useHealthStore((s) => s.quickMeals);
  const consumedMacros = useHealthStore((s) => s.consumedMacros);
  const dietPlan = useHealthStore((s) => s.dietPlan);
  const remainingCalories = useHealthStore((s) => s.remainingCalories);
  const waterTargetLiters = useHealthStore((s) => s.waterTargetLiters);

  const isToday = nutritionDayKey === calendarDayKey;

  return useMemo(() => {
    const todayMealLog: DailyMealLog = isToday ? mealLog : { ...EMPTY_MEAL_LOG };
    const todayQuickMeals = isToday ? quickMeals : EMPTY_QUICK_MEALS;
    const todayConsumed = isToday ? consumedMacros : EMPTY_MACROS;
    const todayRemaining = isToday ? remainingCalories : dietPlan.calories;

    return {
      calendarDayKey,
      nutritionDayKey,
      isToday,
      mealLog: todayMealLog,
      quickMeals: todayQuickMeals,
      consumedMacros: todayConsumed,
      remainingCalories: todayRemaining,
      dietPlan,
      waterTargetLiters,
    };
  }, [
    calendarDayKey,
    consumedMacros,
    dietPlan,
    isToday,
    mealLog,
    nutritionDayKey,
    quickMeals,
    remainingCalories,
    waterTargetLiters,
  ]);
}
