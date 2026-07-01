/** Matches DB `xp_required_for_level` / technical.md exponential curve. */
export const XP_CURVE_BASE = 1000;
export const XP_CURVE_ALPHA = 1.5;
export const HABIT_BASE_XP = 25;
export const WORKOUT_XP_CAP = 500;
export const WORKOUT_XP_MIN = 40;

export function totalXpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }
  return Math.round(XP_CURVE_BASE * Math.pow(level - 1, XP_CURVE_ALPHA));
}

/** XP required to advance from `level` to `level + 1`. */
export function getXpRequiredForLevel(level: number): number {
  return Math.max(100, totalXpForLevel(level + 1) - totalXpForLevel(level));
}

/** XP = min(500, VL / 10) with a floor for bodyweight sessions. */
export function calculateWorkoutXpFromTonnage(
  tonnageKg: number,
  completedSetCount: number,
): number {
  if (completedSetCount <= 0) {
    return 0;
  }

  if (tonnageKg <= 0) {
    return WORKOUT_XP_MIN;
  }

  return Math.max(WORKOUT_XP_MIN, Math.min(WORKOUT_XP_CAP, Math.round(tonnageKg / 10)));
}

/** XP = points_value + min(50, current_streak × 2). */
export function calculateHabitXp(streakDays: number, pointsValue = HABIT_BASE_XP): number {
  const safeStreak = Math.max(0, streakDays);
  return pointsValue + Math.min(50, safeStreak * 2);
}
