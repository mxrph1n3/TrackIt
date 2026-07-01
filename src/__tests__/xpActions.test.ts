import { XP_ACTION_LABELS, XP_REWARDS } from '../lib/gamification/xpActions';
import { isDailyTaskStreakComplete } from '../lib/gamification/progression';

describe('xpActions', () => {
  it('defines stable reward amounts', () => {
    expect(XP_REWARDS.TASK_COMPLETE).toBe(15);
    expect(XP_REWARDS.SUBTASK_COMPLETE).toBe(5);
    expect(XP_REWARDS.HABIT_COMPLETE).toBe(25);
    expect(XP_REWARDS.DAILY_STREAK_BONUS).toBe(150);
    expect(XP_REWARDS.MOOD_LOG).toBe(10);
  });

  it('maps every reward to an action label', () => {
    for (const key of Object.keys(XP_REWARDS)) {
      expect(XP_ACTION_LABELS[key as keyof typeof XP_REWARDS]).toBeTruthy();
    }
  });
});

describe('daily streak completion', () => {
  it('requires at least one task and full completion', () => {
    expect(isDailyTaskStreakComplete(0, 0)).toBe(false);
    expect(isDailyTaskStreakComplete(2, 3)).toBe(false);
    expect(isDailyTaskStreakComplete(3, 3)).toBe(true);
  });
});
