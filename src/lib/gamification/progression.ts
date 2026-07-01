import type { XpProgress } from '../../types/gamification';
import type { DashboardProgress } from '../../types/dashboard';
import type { DashboardMetricsRaw } from '../dashboard/metrics';
import { calculateDashboardProgress, DEFAULT_FOCUS_MINUTES_TARGET } from '../dashboard/metrics';
import { getXpRequiredForLevel } from './xpFormulas';

export { getXpRequiredForLevel };

export function getXpProgress(level: number, xp: number): XpProgress {
  const requiredXp = getXpRequiredForLevel(level);
  const percent =
    requiredXp > 0 ? Math.min(100, Math.round((xp / requiredXp) * 100)) : 0;

  return {
    currentXp: xp,
    requiredXp,
    percent,
  };
}

export type RankCode = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

/** Rank tiers aligned with Supabase `get_user_tier()`. */
export function getRankFromLevel(level: number): RankCode {
  if (level >= 96) return 'SS';
  if (level >= 71) return 'S';
  if (level >= 46) return 'A';
  if (level >= 26) return 'B';
  if (level >= 11) return 'C';
  return 'D';
}

export function getUserTierFromLevel(level: number): string {
  return `${getRankFromLevel(level)}-Tier`;
}

export function getUserTierCodeFromLevel(level: number): string {
  return getRankFromLevel(level);
}

export function getPerformanceTier(percentile: number): { tier: string; label: string } {
  if (percentile >= 94) {
    return { tier: 'S-Tier', label: 'Elite Life Performance' };
  }
  if (percentile >= 85) {
    return { tier: 'A-Tier', label: 'High Performance' };
  }
  if (percentile >= 70) {
    return { tier: 'B-Tier', label: 'Strong Momentum' };
  }
  if (percentile >= 50) {
    return { tier: 'C-Tier', label: 'Building Discipline' };
  }
  return { tier: 'D-Tier', label: 'Early Progress' };
}

export function getTopPercentileLabel(percentile: number): string {
  const top = Math.max(1, 100 - percentile + 1);
  return `Top ${top}%`;
}

export type PerformanceTierPalette = {
  tier: string;
  primary: string;
  secondary: string;
  highlight: string;
  glow: string;
  sheen: string;
};

const TIER_PALETTES: Record<string, PerformanceTierPalette> = {
  'S-Tier': {
    tier: 'S-Tier',
    primary: '#FFD700',
    secondary: '#775DD8',
    highlight: '#FFF7CC',
    glow: 'rgba(255, 215, 0, 0.95)',
    sheen: 'rgba(255, 247, 204, 0.8)',
  },
  'SS-Tier': {
    tier: 'SS-Tier',
    primary: '#F472B6',
    secondary: '#FFD700',
    highlight: '#FDF2F8',
    glow: 'rgba(244, 114, 182, 0.95)',
    sheen: 'rgba(255, 255, 255, 0.75)',
  },
  'A-Tier': {
    tier: 'A-Tier',
    primary: '#9580E8',
    secondary: '#775DD8',
    highlight: '#F3E8FF',
    glow: 'rgba(168, 85, 247, 0.95)',
    sheen: 'rgba(255, 255, 255, 0.65)',
  },
  'B-Tier': {
    tier: 'B-Tier',
    primary: '#818CF8',
    secondary: '#6366F1',
    highlight: '#E0E7FF',
    glow: 'rgba(99, 102, 241, 0.92)',
    sheen: 'rgba(224, 231, 255, 0.55)',
  },
  'C-Tier': {
    tier: 'C-Tier',
    primary: '#34D399',
    secondary: '#6366F1',
    highlight: '#D1FAE5',
    glow: 'rgba(52, 211, 153, 0.85)',
    sheen: 'rgba(209, 250, 229, 0.5)',
  },
  'D-Tier': {
    tier: 'D-Tier',
    primary: '#94A3B8',
    secondary: '#64748B',
    highlight: '#E2E8F0',
    glow: 'rgba(148, 163, 184, 0.75)',
    sheen: 'rgba(226, 232, 240, 0.45)',
  },
};

export function getPerformanceTierPalette(tier: string): PerformanceTierPalette {
  return TIER_PALETTES[tier] ?? TIER_PALETTES['B-Tier'];
}

export type DailyProgressInput = {
  completedTasks: number;
  totalTasks: number;
  completedHabits: number;
  totalHabits: number;
  focusMinutesToday: number;
  focusTargetMinutes?: number;
  workoutCompletedToday: boolean;
  nutritionPercent: number;
  calorieTarget?: number;
};

/** Daily dashboard ring — weighted average of Discipline, Habits, Mindset, Health. */
export function calculateDailyProgress(input: DailyProgressInput): DashboardProgress {
  const raw: DashboardMetricsRaw = {
    completedTasks: input.completedTasks,
    totalTasks: input.totalTasks,
    loggedHabits: input.completedHabits,
    expectedHabits: input.totalHabits,
    focusMinutesToday: input.focusMinutesToday,
    focusMinutesTarget: input.focusTargetMinutes ?? DEFAULT_FOCUS_MINUTES_TARGET,
    workoutCompletedToday: input.workoutCompletedToday,
    consumedCalories:
      input.nutritionPercent > 0
        ? Math.round((input.nutritionPercent / 100) * (input.calorieTarget ?? 1700))
        : 0,
    calorieTarget: input.calorieTarget ?? 1700,
  };

  if (input.nutritionPercent > 0 && raw.consumedCalories === 0) {
    raw.consumedCalories = Math.round((input.nutritionPercent / 100) * raw.calorieTarget);
  }

  return calculateDashboardProgress(raw);
}

/** True when every task scheduled for today is complete (daily streak bonus). */
export function isDailyTaskStreakComplete(completed: number, total: number): boolean {
  return total > 0 && completed === total;
}
