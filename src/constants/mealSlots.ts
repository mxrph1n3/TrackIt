import type { DailyMealLog, MealSlot, QuickMealLog } from '../types/health';

export const MEAL_SLOT_ORDER: MealSlot[] = [
  'breakfast',
  'lunch',
  'snack',
  'dinner',
  'evening_snack',
];

export const MEAL_SLOT_TIMES: Record<MealSlot, string> = {
  breakfast: '08:00',
  lunch: '13:00',
  snack: '16:30',
  dinner: '19:00',
  evening_snack: '21:00',
};

export function resolveMealSlot(
  mealLog: DailyMealLog,
  quickMeals: QuickMealLog,
  preferredSlot?: MealSlot,
): MealSlot {
  if (preferredSlot) {
    return preferredSlot;
  }

  return (
    MEAL_SLOT_ORDER.find((slot) => !mealLog[slot] && !quickMeals[slot]) ?? 'evening_snack'
  );
}

export function isMealSlotLogged(
  slot: MealSlot,
  mealLog: DailyMealLog,
  quickMeals: QuickMealLog,
): boolean {
  return Boolean(mealLog[slot]) || Boolean(quickMeals[slot]);
}
