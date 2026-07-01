import type { DashboardProgress } from '../../types/dashboard';

export const DEFAULT_FOCUS_MINUTES_TARGET = 180;
export const DASHBOARD_AXIS_WEIGHT = 0.25;

export type DashboardMetricsRaw = {
  completedTasks: number;
  totalTasks: number;
  loggedHabits: number;
  expectedHabits: number;
  focusMinutesToday: number;
  focusMinutesTarget: number;
  workoutCompletedToday: boolean;
  consumedCalories: number;
  calorieTarget: number;
};

export const DASHBOARD_CATEGORY_COLORS = {
  discipline: '#775DD8',
  habits: '#6366F1',
  mindset: '#7C3AED',
  health: '#5B21B6',
} as const;

export const EMPTY_DASHBOARD_METRICS_RAW: DashboardMetricsRaw = {
  completedTasks: 0,
  totalTasks: 0,
  loggedHabits: 0,
  expectedHabits: 0,
  focusMinutesToday: 0,
  focusMinutesTarget: DEFAULT_FOCUS_MINUTES_TARGET,
  workoutCompletedToday: false,
  consumedCalories: 0,
  calorieTarget: 1700,
};

function ratioPercent(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((completed / total) * 100));
}

/** M = min(100%, focus_actual / focus_target × 100%) per technical spec. */
export function calculateMindsetScore(
  focusMinutes: number,
  targetMinutes = DEFAULT_FOCUS_MINUTES_TARGET,
): number {
  if (targetMinutes <= 0 || focusMinutes <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((focusMinutes / targetMinutes) * 100));
}

/** 100% inside ±10% of target; linear decay toward 0% at 50% or 150% intake. */
export function calculateNutritionScore(consumed: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  if (consumed <= 0) {
    return 0;
  }

  const ratio = consumed / target;
  const deviation = Math.abs(ratio - 1);

  if (deviation <= 0.1) {
    return 100;
  }

  const maxDeviation = 0.5;
  if (deviation >= maxDeviation) {
    return 0;
  }

  const score = 100 - ((deviation - 0.1) / (maxDeviation - 0.1)) * 100;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculateWorkoutScore(workoutCompletedToday: boolean): number {
  return workoutCompletedToday ? 100 : 0;
}

/**
 * Overall Progress per technical spec:
 * OP = 0.25·D + 0.25·H + 0.25·M + 0.25·Hl
 * D = tasks done / tasks planned, H = habits, M = focus minutes, Hl = nutrition + workout.
 */
export function calculateDashboardProgress(raw: DashboardMetricsRaw): DashboardProgress {
  const disciplineProgress = ratioPercent(raw.completedTasks, raw.totalTasks);
  const habitsProgress = ratioPercent(raw.loggedHabits, raw.expectedHabits);
  const mindsetProgress = calculateMindsetScore(raw.focusMinutesToday, raw.focusMinutesTarget);
  const workoutScore = calculateWorkoutScore(raw.workoutCompletedToday);
  const nutritionScore = calculateNutritionScore(raw.consumedCalories, raw.calorieTarget);
  const healthProgress = Math.round(workoutScore * 0.5 + nutritionScore * 0.5);

  const overall = Math.round(
    disciplineProgress * DASHBOARD_AXIS_WEIGHT +
      habitsProgress * DASHBOARD_AXIS_WEIGHT +
      mindsetProgress * DASHBOARD_AXIS_WEIGHT +
      healthProgress * DASHBOARD_AXIS_WEIGHT,
  );

  return {
    overall,
    categories: [
      {
        id: 'discipline',
        label: 'Discipline',
        percent: disciplineProgress,
        color: DASHBOARD_CATEGORY_COLORS.discipline,
      },
      {
        id: 'habits',
        label: 'Habits',
        percent: habitsProgress,
        color: DASHBOARD_CATEGORY_COLORS.habits,
      },
      {
        id: 'mindset',
        label: 'Mindset',
        percent: mindsetProgress,
        color: DASHBOARD_CATEGORY_COLORS.mindset,
      },
      {
        id: 'health',
        label: 'Health',
        percent: healthProgress,
        color: DASHBOARD_CATEGORY_COLORS.health,
      },
    ],
  };
}
