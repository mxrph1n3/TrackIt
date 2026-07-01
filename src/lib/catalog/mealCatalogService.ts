import type { Cuisine, DietGoal, Meal, MealSlot, PricingTier } from '../../types/health';
import { attachMealInstructions } from '../../constants/mealRecipes';
import { isSupabaseConfigured, supabase } from '../supabase';

function loadMealFallback(): { library: Meal[]; byId: Record<string, Meal> } {
  const meals = require('../../constants/meals') as {
    MEAL_LIBRARY: Meal[];
    MEAL_BY_ID: Record<string, Meal>;
  };
  return { library: meals.MEAL_LIBRARY, byId: meals.MEAL_BY_ID };
}

type DbMealRow = {
  meal_id: string;
  name: string;
  category: MealSlot;
  cuisine: string;
  tier: PricingTier;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  goal_tags: string[];
  prep_time: number;
  swap_ids: string[];
};

type DbMealIngredientRow = {
  meal_id: string;
  ingredient_id: string;
  grams: number;
};

let mealLibrary: Meal[] | null = null;
let mealById: Record<string, Meal> | null = null;
let isLive = false;
let hydrating: Promise<void> | null = null;

function ensureMealFallback() {
  if (!mealLibrary || !mealById) {
    const fallback = loadMealFallback();
    mealLibrary = fallback.library;
    mealById = fallback.byId;
  }
}

function mapDbMeal(row: DbMealRow, ingredients: DbMealIngredientRow[]): Meal {
  return attachMealInstructions({
    meal_id: row.meal_id,
    name: row.name,
    category: row.category,
    cuisine: row.cuisine as Cuisine,
    tier: row.tier,
    ingredients: ingredients
      .filter((entry) => entry.meal_id === row.meal_id)
      .map((entry) => ({ id: entry.ingredient_id, grams: Number(entry.grams) })),
    macros: {
      calories: row.calories,
      protein: Number(row.protein),
      fat: Number(row.fat),
      carbs: Number(row.carbs),
    },
    goal_tags: row.goal_tags as DietGoal[],
    prep_time: row.prep_time,
    swap_ids: row.swap_ids ?? [],
  });
}

export async function hydrateMealCatalog(): Promise<void> {
  if (hydrating) {
    return hydrating;
  }

  hydrating = (async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      const [mealsResult, ingredientsResult] = await Promise.all([
        supabase.from('meals').select('*').order('name'),
        supabase.from('meal_ingredients').select('meal_id, ingredient_id, grams'),
      ]);

      if (mealsResult.error) {
        console.warn('[MealCatalog] meals query failed:', mealsResult.error.message);
        return;
      }

      const rows = (mealsResult.data ?? []) as DbMealRow[];
      if (rows.length === 0) {
        return;
      }

      const ingredientRows = (ingredientsResult.data ?? []) as DbMealIngredientRow[];
      const meals = rows.map((row) => mapDbMeal(row, ingredientRows));

      mealLibrary = meals;
      mealById = Object.fromEntries(meals.map((meal) => [meal.meal_id, meal]));
      isLive = true;
    } catch (error) {
      console.warn('[MealCatalog] hydrate failed, using constants:', error);
    } finally {
      hydrating = null;
    }
  })();

  return hydrating;
}

export function getMealLibrary(): Meal[] {
  ensureMealFallback();
  return mealLibrary ?? [];
}

export function getMealById(mealId: string): Meal | undefined {
  ensureMealFallback();
  const meal = mealById?.[mealId];
  return meal ? attachMealInstructions(meal) : undefined;
}

export function hasMealId(mealId: string): boolean {
  ensureMealFallback();
  return mealId in (mealById ?? {});
}

export function isMealCatalogLive(): boolean {
  return isLive;
}
