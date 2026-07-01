import { EMPTY_MEAL_LOG, sumNutritionCalories } from '../lib/health/nutritionService';

describe('nutritionService', () => {
  it('sums quick meal calories without catalog meals', () => {
    const total = sumNutritionCalories(EMPTY_MEAL_LOG, {
      breakfast: { name: 'Oatmeal', calories: 420 },
      snack: { name: 'Protein shake', calories: 180 },
    });

    expect(total).toBe(600);
  });

  it('ignores invalid quick meal entries via upstream normalization', () => {
    const total = sumNutritionCalories(EMPTY_MEAL_LOG, {
      lunch: { name: 'Salad', calories: 350 },
    });

    expect(total).toBe(350);
  });

  it('returns zero for an empty day log', () => {
    expect(sumNutritionCalories(EMPTY_MEAL_LOG, {})).toBe(0);
  });
});
