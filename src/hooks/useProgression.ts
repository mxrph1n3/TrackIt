import { useCallback, useMemo } from 'react';

import {
  calculateDailyProgress,
  getRankFromLevel,
  getUserTierFromLevel,
  getXpProgress,
  isDailyTaskStreakComplete,
  type DailyProgressInput,
  type RankCode,
} from '../lib/gamification/progression';
import { calculateHabitXp } from '../lib/gamification/xpFormulas';
import { fetchHabitStreakDays } from '../lib/habits/service';
import {
  XP_ACTION_LABELS,
  XP_REWARDS,
  type XpActionKey,
} from '../lib/gamification/xpActions';
import type { DashboardProgress } from '../types/dashboard';
import { useGamification } from './useGamification';

export type UseProgressionResult = ReturnType<typeof useProgression>;

export function useProgression() {
  const gamification = useGamification();
  const { profile, level, xp, addXpAction } = gamification;

  const rank = useMemo(() => getRankFromLevel(level), [level]);
  const tierLabel = useMemo(() => getUserTierFromLevel(level), [level]);
  const xpProgress = useMemo(() => getXpProgress(level, xp), [level, xp]);

  const awardXp = useCallback(
    async (action: XpActionKey) => {
      const amount = XP_REWARDS[action];
      const label = XP_ACTION_LABELS[action];
      return addXpAction(amount, label);
    },
    [addXpAction],
  );

  const awardXpAmount = useCallback(
    async (amount: number, sourceType: string) => {
      if (amount <= 0) {
        return false;
      }
      return addXpAction(amount, sourceType);
    },
    [addXpAction],
  );

  const awardHabitCompletion = useCallback(
    async (userId: string, habitId: string) => {
      const streakDays = await fetchHabitStreakDays(userId, habitId);
      const amount = calculateHabitXp(streakDays);
      return awardXpAmount(amount, `habit_completed:${habitId}`);
    },
    [awardXpAmount],
  );

  const computeDailyProgress = useCallback(
    (input: DailyProgressInput): DashboardProgress => calculateDailyProgress(input),
    [],
  );

  const profileStats = useMemo(
    () => ({
      username: profile?.username ?? 'HUNTER',
      level,
      rank: rank as RankCode,
      tierLabel,
      daysActive: profile?.days_active ?? 1,
      habitsCompleted: profile?.habits_count ?? 0,
      focusHours: Number(profile?.focus_hours ?? 0),
      xp,
      xpProgress,
    }),
    [level, profile, rank, tierLabel, xp, xpProgress],
  );

  const checkDailyStreakBonus = useCallback(
    async (completedTasks: number, totalTasks: number) => {
      if (isDailyTaskStreakComplete(completedTasks, totalTasks)) {
        await awardXp('DAILY_STREAK_BONUS');
      }
    },
    [awardXp],
  );

  return {
    ...gamification,
    rank,
    tierLabel,
    xpProgress,
    profileStats,
    awardXp,
    awardXpAmount,
    awardHabitCompletion,
    computeDailyProgress,
    checkDailyStreakBonus,
    XP_REWARDS,
  };
}
