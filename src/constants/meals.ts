import type { Meal } from '../types/health';
import { attachMealInstructions, getMealInstructions } from './mealRecipes';

type MealDefinition = Omit<Meal, 'instructions'>;

const MEAL_DEFINITIONS: MealDefinition[] = [
  {
    meal_id: 'protein_oat_bowl',
    name: 'Protein Oat Bowl',
    category: 'breakfast',
    cuisine: 'european',
    tier: 'mid',
    ingredients: [
      { id: 'oats', grams: 80 },
      { id: 'greek_yogurt', grams: 150 },
      { id: 'banana', grams: 100 },
    ],
    macros: { calories: 470, protein: 23, fat: 8, carbs: 70 },
    goal_tags: ['fat_loss', 'maintenance', 'bulk'],
    prep_time: 10,
    swap_ids: ['yogurt_power_bowl', 'egg_breakfast_plate'],
  },
  {
    meal_id: 'yogurt_power_bowl',
    name: 'Yogurt Power Bowl',
    category: 'breakfast',
    cuisine: 'european',
    tier: 'mid',
    ingredients: [
      { id: 'greek_yogurt', grams: 250 },
      { id: 'oats', grams: 40 },
      { id: 'berries', grams: 100 },
    ],
    macros: { calories: 390, protein: 30, fat: 7, carbs: 45 },
    goal_tags: ['fat_loss', 'maintenance'],
    prep_time: 5,
    swap_ids: ['protein_oat_bowl', 'yogurt_snack_bowl'],
  },
  {
    meal_id: 'chicken_rice_bowl',
    name: 'Chicken Rice Bowl',
    category: 'lunch',
    cuisine: 'european',
    tier: 'mid',
    ingredients: [
      { id: 'chicken_breast', grams: 150 },
      { id: 'rice_dry', grams: 80 },
      { id: 'olive_oil', grams: 10 },
    ],
    macros: { calories: 560, protein: 41, fat: 14, carbs: 62 },
    goal_tags: ['fat_loss', 'maintenance', 'bulk'],
    prep_time: 25,
    swap_ids: ['salmon_rice_bowl', 'turkey_quinoa_bowl', 'chicken_teriyaki_bowl'],
  },
  {
    meal_id: 'salmon_rice_bowl',
    name: 'Salmon Rice Bowl',
    category: 'lunch',
    cuisine: 'european',
    tier: 'premium',
    ingredients: [
      { id: 'salmon', grams: 140 },
      { id: 'rice_dry', grams: 70 },
      { id: 'vegetables', grams: 150 },
    ],
    macros: { calories: 580, protein: 35, fat: 20, carbs: 55 },
    goal_tags: ['maintenance', 'bulk'],
    prep_time: 30,
    swap_ids: ['chicken_rice_bowl', 'salmon_veg_plate'],
  },
  {
    meal_id: 'salmon_veg_plate',
    name: 'Salmon Veg Plate',
    category: 'dinner',
    cuisine: 'european',
    tier: 'premium',
    ingredients: [
      { id: 'salmon', grams: 140 },
      { id: 'vegetables', grams: 200 },
      { id: 'olive_oil', grams: 10 },
    ],
    macros: { calories: 520, protein: 34, fat: 25, carbs: 20 },
    goal_tags: ['fat_loss', 'maintenance'],
    prep_time: 25,
    swap_ids: ['chicken_rice_bowl', 'chicken_veg_bowl'],
  },
  {
    meal_id: 'chicken_veg_bowl',
    name: 'Chicken Veg Bowl',
    category: 'dinner',
    cuisine: 'european',
    tier: 'mid',
    ingredients: [
      { id: 'chicken_breast', grams: 160 },
      { id: 'vegetables', grams: 200 },
      { id: 'rice_dry', grams: 50 },
    ],
    macros: { calories: 500, protein: 42, fat: 10, carbs: 45 },
    goal_tags: ['fat_loss', 'maintenance'],
    prep_time: 25,
    swap_ids: ['salmon_veg_plate', 'chicken_rice_bowl'],
  },
  {
    meal_id: 'yogurt_snack_bowl',
    name: 'Yogurt Snack Bowl',
    category: 'snack',
    cuisine: 'european',
    tier: 'cheap',
    ingredients: [
      { id: 'greek_yogurt', grams: 250 },
      { id: 'banana', grams: 100 },
      { id: 'oats', grams: 30 },
    ],
    macros: { calories: 350, protein: 25, fat: 6, carbs: 45 },
    goal_tags: ['fat_loss', 'maintenance'],
    prep_time: 5,
    swap_ids: ['protein_shake', 'yogurt_power_bowl'],
  },
  {
    meal_id: 'protein_shake',
    name: 'Protein Shake',
    category: 'snack',
    cuisine: 'fitness',
    tier: 'cheap',
    ingredients: [
      { id: 'whey', grams: 30 },
      { id: 'milk', grams: 250 },
    ],
    macros: { calories: 220, protein: 25, fat: 5, carbs: 15 },
    goal_tags: ['fat_loss', 'maintenance', 'bulk'],
    prep_time: 2,
    swap_ids: ['yogurt_snack_bowl'],
  },
  {
    meal_id: 'salmon_rice_plate',
    name: 'Salmon Rice Plate',
    category: 'dinner',
    cuisine: 'european',
    tier: 'premium',
    ingredients: [
      { id: 'salmon', grams: 140 },
      { id: 'rice_dry', grams: 75 },
      { id: 'vegetables', grams: 120 },
    ],
    macros: { calories: 580, protein: 36, fat: 19, carbs: 54 },
    goal_tags: ['fat_loss', 'maintenance'],
    prep_time: 28,
    swap_ids: ['salmon_veg_plate', 'chicken_rice_bowl', 'turkey_quinoa_bowl'],
  },
  {
    meal_id: 'italian_chicken_pasta',
    name: 'Chicken Fit Pasta',
    category: 'lunch',
    cuisine: 'italian',
    tier: 'mid',
    ingredients: [
      { id: 'pasta', grams: 90 },
      { id: 'chicken_breast', grams: 150 },
      { id: 'tomato_sauce', grams: 120 },
    ],
    macros: { calories: 640, protein: 45, fat: 12, carbs: 85 },
    goal_tags: ['maintenance', 'bulk'],
    prep_time: 20,
    swap_ids: ['chicken_rice_bowl', 'chicken_teriyaki_bowl'],
  },
  {
    meal_id: 'chicken_teriyaki_bowl',
    name: 'Chicken Teriyaki Bowl',
    category: 'lunch',
    cuisine: 'asian',
    tier: 'mid',
    ingredients: [
      { id: 'chicken_breast', grams: 150 },
      { id: 'rice_dry', grams: 80 },
      { id: 'teriyaki_sauce', grams: 30 },
    ],
    macros: { calories: 590, protein: 42, fat: 10, carbs: 75 },
    goal_tags: ['maintenance', 'bulk'],
    prep_time: 22,
    swap_ids: ['chicken_rice_bowl', 'italian_chicken_pasta'],
  },
  {
    meal_id: 'turkey_quinoa_bowl',
    name: 'Turkey Quinoa Bowl',
    category: 'lunch',
    cuisine: 'european',
    tier: 'mid',
    ingredients: [
      { id: 'turkey', grams: 150 },
      { id: 'quinoa', grams: 80 },
      { id: 'olive_oil', grams: 10 },
    ],
    macros: { calories: 590, protein: 42, fat: 15, carbs: 58 },
    goal_tags: ['fat_loss', 'maintenance'],
    prep_time: 28,
    swap_ids: ['chicken_rice_bowl', 'salmon_rice_bowl'],
  },
  {
    meal_id: 'egg_breakfast_plate',
    name: 'Egg Breakfast Plate',
    category: 'breakfast',
    cuisine: 'european',
    tier: 'cheap',
    ingredients: [
      { id: 'eggs', grams: 180 },
      { id: 'whole_grain_bread', grams: 80 },
    ],
    macros: { calories: 480, protein: 28, fat: 22, carbs: 36 },
    goal_tags: ['maintenance', 'bulk'],
    prep_time: 12,
    swap_ids: ['protein_oat_bowl', 'yogurt_power_bowl'],
  },
];

/** Production meal library — food.md Level 2 JSON shape. */
export const MEAL_LIBRARY: Meal[] = MEAL_DEFINITIONS.map((meal) => attachMealInstructions(meal));

export const MEAL_BY_ID = Object.fromEntries(
  MEAL_LIBRARY.map((meal) => [meal.meal_id, meal]),
) as Record<string, Meal>;

export function getMealLibrary(): Meal[] {
  // Lazy require avoids circular init with mealCatalogService.
  return require('../lib/catalog/mealCatalogService').getMealLibrary() as Meal[];
}

export function getMealById(mealId: string): Meal | undefined {
  return require('../lib/catalog/mealCatalogService').getMealById(mealId) as Meal | undefined;
}

export function hasMealId(mealId: string): boolean {
  return require('../lib/catalog/mealCatalogService').hasMealId(mealId) as boolean;
}

export { getMealInstructions };

export const SLOT_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
  evening_snack: 'Evening Snack',
};
