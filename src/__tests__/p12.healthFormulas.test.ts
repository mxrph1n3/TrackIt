import {
  estimateEpley1Rm,
  extractSessionPrCandidates,
} from '../lib/health/exercisePrService';
import {
  buildNutritionTargets,
  computeBmr,
  computeCalorieTarget,
  computeTdee,
  computeWaterTargetMl,
  defaultGoalPaceKg,
} from '../lib/health/nutritionTargets';
import type { WorkoutExercise } from '../types/health';

describe('nutritionTargets (P12 spec)', () => {
  it('computes male BMR via Mifflin-St Jeor', () => {
    expect(computeBmr(80, 180, 30, 'male')).toBe(1780);
  });

  it('computes female BMR via Mifflin-St Jeor', () => {
    expect(computeBmr(60, 165, 28, 'female')).toBe(1330.25);
  });

  it('derives TDEE from activity factor', () => {
    const bmr = computeBmr(78, 175, 30, 'male');
    expect(computeTdee(bmr, 1.55)).toBe(Math.round(bmr * 1.55));
  });

  it('applies weekly pace deficit for fat loss targets', () => {
    const tdee = 2500;
    expect(computeCalorieTarget(tdee, 'fat_loss', 0.5)).toBe(1950);
    expect(computeCalorieTarget(tdee, 'maintenance', 0)).toBe(2500);
    expect(computeCalorieTarget(tdee, 'bulk', 0.25)).toBe(2775);
  });

  it('builds diet plan macros and water target', () => {
    const targets = buildNutritionTargets({
      weightKg: 78,
      heightCm: 175,
      age: 30,
      gender: 'male',
      activityFactor: 1.55,
      dietGoal: 'fat_loss',
      goalPaceKg: defaultGoalPaceKg('fat_loss'),
    });

    expect(targets.dietPlan.goal).toBe('fat_loss');
    expect(targets.dietPlan.calories).toBeGreaterThan(1200);
    expect(targets.proteinG).toBeGreaterThan(0);
    expect(computeWaterTargetMl(78)).toBe(2730);
    expect(computeWaterTargetMl(78, 60)).toBe(3730);
  });
});

describe('exercisePrService (P12 spec)', () => {
  it('estimates 1RM with Epley formula', () => {
    expect(estimateEpley1Rm(100, 5)).toBeCloseTo(116.67, 1);
    expect(estimateEpley1Rm(0, 5)).toBe(0);
  });

  it('extracts best session PR candidates from completed sets', () => {
    const exercises: WorkoutExercise[] = [
      {
        id: 'ex-1',
        name: 'Bench Press',
        sets: [
          { id: 's1', weightKg: 80, reps: 5, completed: true },
          { id: 's2', weightKg: 85, reps: 3, completed: true },
          { id: 's3', weightKg: 90, reps: 1, completed: false },
        ],
      },
      {
        id: 'ex-2',
        name: 'Row',
        sets: [{ id: 's1', weightKg: 0, reps: 10, completed: true }],
      },
    ];

    const candidates = extractSessionPrCandidates(exercises);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.exerciseName).toBe('Bench Press');
    expect(candidates[0]?.estimated1RmKg).toBeCloseTo(93.5, 1);
    expect(candidates[0]?.bestWeightKg).toBe(85);
    expect(candidates[0]?.bestReps).toBe(3);
  });
});
