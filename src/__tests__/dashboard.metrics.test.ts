import {
  calculateDashboardProgress,
  calculateMindsetScore,
  DEFAULT_FOCUS_MINUTES_TARGET,
  EMPTY_DASHBOARD_METRICS_RAW,
} from '../lib/dashboard/metrics';

describe('dashboard metrics (P9 spec)', () => {
  it('calculates discipline as pure task completion ratio', () => {
    const progress = calculateDashboardProgress({
      ...EMPTY_DASHBOARD_METRICS_RAW,
      completedTasks: 3,
      totalTasks: 4,
    });

    expect(progress.categories.find((item) => item.id === 'discipline')?.percent).toBe(75);
  });

  it('calculates mindset from focus minutes capped at 100%', () => {
    expect(calculateMindsetScore(90, 180)).toBe(50);
    expect(calculateMindsetScore(180, 180)).toBe(100);
    expect(calculateMindsetScore(240, 180)).toBe(100);
  });

  it('uses four spec axes with equal 0.25 weights', () => {
    const progress = calculateDashboardProgress({
      completedTasks: 4,
      totalTasks: 4,
      loggedHabits: 2,
      expectedHabits: 2,
      focusMinutesToday: 90,
      focusMinutesTarget: DEFAULT_FOCUS_MINUTES_TARGET,
      workoutCompletedToday: true,
      consumedCalories: 1700,
      calorieTarget: 1700,
    });

    expect(progress.categories.map((item) => item.id)).toEqual([
      'discipline',
      'habits',
      'mindset',
      'health',
    ]);
    expect(progress.categories.find((item) => item.id === 'mindset')?.label).toBe('Mindset');
    expect(progress.overall).toBe(88);
  });

  it('returns zero overall when no activity is logged', () => {
    const progress = calculateDashboardProgress(EMPTY_DASHBOARD_METRICS_RAW);
    expect(progress.overall).toBe(0);
  });
});
