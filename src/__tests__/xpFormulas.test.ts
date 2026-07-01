import {
  calculateHabitXp,
  calculateWorkoutXpFromTonnage,
  getXpRequiredForLevel,
  totalXpForLevel,
  WORKOUT_XP_CAP,
  WORKOUT_XP_MIN,
} from '../lib/gamification/xpFormulas';
import { computeWorkoutXp } from '../lib/health/workoutEngine';

describe('xpFormulas (P10 spec)', () => {
  it('uses exponential level curve from technical.md', () => {
    expect(totalXpForLevel(1)).toBe(0);
    expect(totalXpForLevel(2)).toBe(1000);
    expect(getXpRequiredForLevel(1)).toBe(1000);
    expect(getXpRequiredForLevel(50)).toBe(10553);
  });

  it('caps workout XP at tonnage / 10', () => {
    expect(calculateWorkoutXpFromTonnage(8200, 12)).toBe(500);
    expect(calculateWorkoutXpFromTonnage(420, 8)).toBe(42);
    expect(calculateWorkoutXpFromTonnage(0, 6)).toBe(40);
    expect(calculateWorkoutXpFromTonnage(1000, 0)).toBe(0);
    expect(WORKOUT_XP_CAP).toBe(500);
  });

  it('adds streak bonus to habit XP', () => {
    expect(calculateHabitXp(0)).toBe(25);
    expect(calculateHabitXp(7)).toBe(39);
    expect(calculateHabitXp(25)).toBe(75);
    expect(calculateHabitXp(40)).toBe(75);
  });

  it('awards minimum workout XP when a session finishes without logged sets', () => {
    expect(
      computeWorkoutXp(
        {
          exerciseCount: 4,
          completedExerciseCount: 0,
          setCount: 12,
          completedSetCount: 0,
          repCount: 0,
          tonnageKg: 0,
        },
        12,
      ),
    ).toBe(WORKOUT_XP_MIN);
  });
});
