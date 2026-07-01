/** Canonical EXP rewards — keep in sync with product balance docs. */
export const XP_REWARDS = {
  TASK_COMPLETE: 15,
  SUBTASK_COMPLETE: 5,
  HABIT_COMPLETE: 25,
  FOCUS_SESSION_30MIN: 40,
  WORKOUT_COMPLETE: 500,
  FOOD_OR_WATER_LOG: 10,
  MOOD_LOG: 10,
  DAILY_STREAK_BONUS: 150,
} as const;

export type XpActionKey = keyof typeof XP_REWARDS;

export const XP_ACTION_LABELS: Record<XpActionKey, string> = {
  TASK_COMPLETE: 'task_completed',
  SUBTASK_COMPLETE: 'subtask_completed',
  HABIT_COMPLETE: 'habit_completed',
  FOCUS_SESSION_30MIN: 'focus_session',
  WORKOUT_COMPLETE: 'workout_completed',
  FOOD_OR_WATER_LOG: 'food_or_water_logged',
  MOOD_LOG: 'mood_logged',
  DAILY_STREAK_BONUS: 'daily_streak_bonus',
};

export const FOCUS_TARGET_MINUTES = 120;
