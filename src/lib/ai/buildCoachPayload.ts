import { fetchTodayTasks } from '../dashboard/service';
import { fetchDashboardFinance } from '../finance/dashboardFinance';
import { getRankFromLevel } from '../gamification/progression';
import { fetchHabitsWithWeek } from '../habits/service';
import { isSupabaseConfigured } from '../supabase';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useHealthStore } from '../../stores/useHealthStore';
import type { TrackItCoachPayload } from './types';

const DEFAULT_CALORIE_TARGET = 1700;
const DEFAULT_MACRO_TARGETS = { protein: 120, fat: 55, carbs: 160 };

function emptyPayload(): TrackItCoachPayload {
  return {
    user_profile: { level: 1, xp: 0, rank: 'E' },
    stats: { discipline: 0, habits: 0, mindset: 0, health: 0 },
    tasks_today: [],
    habits_streaks: {},
    workout_logs: {
      last_session: null,
      volume_load_kg: 0,
      streak_days: 0,
      total_workouts: 0,
    },
    nutrition_logs: {
      calories_consumed: 0,
      target: DEFAULT_CALORIE_TARGET,
      macros: { P: 0, F: 0, C: 0 },
    },
    finance_logs: {
      monthly_budget: 0,
      expenses_current: 0,
      income_current: 0,
      balance: 0,
      display_currency: 'USD',
      savings_goal: null,
    },
  };
}

export async function buildCoachPayload(userId: string): Promise<TrackItCoachPayload> {
  if (!isSupabaseConfigured) {
    return buildCoachPayloadFromStores();
  }

  const profile = useGamificationStore.getState().profile;
  const level = profile?.level ?? useGamificationStore.getState().level ?? 1;
  const xp = profile?.xp ?? useGamificationStore.getState().xp ?? 0;
  const username = profile?.username;

  const [tasks, finance, habitsWeek] = await Promise.all([
    fetchTodayTasks(userId),
    fetchDashboardFinance(userId, username?.toUpperCase() ?? 'TRACKIT MEMBER'),
    fetchHabitsWithWeek(userId).catch(() => [] as Awaited<ReturnType<typeof fetchHabitsWithWeek>>),
  ]);

  const habitStreaks: Record<string, number> = {};
  for (const entry of habitsWeek.slice(0, 8)) {
    habitStreaks[entry.habit.title] = entry.streakDays;
  }

  const base = buildCoachPayloadFromStores();

  return {
    ...base,
    user_profile: {
      level,
      xp,
      rank: getRankFromLevel(level),
      username,
    },
    tasks_today: tasks.map((task) => ({
      title: task.title,
      completed: task.completed,
      time: task.time,
    })),
    habits_streaks: habitStreaks,
    finance_logs: {
      monthly_budget: finance.monthlyBudgetLimit,
      expenses_current: finance.monthlyExpense,
      income_current: finance.monthlyIncome,
      balance: finance.balance,
      display_currency: finance.displayCurrency,
      savings_goal: finance.activeGoal
        ? {
            name: finance.activeGoal.name,
            target: finance.activeGoal.targetAmount,
            saved: finance.activeGoal.savedAmount,
          }
        : null,
    },
  };
}

/** Fast path from in-memory stores (used offline or before network round-trips). */
export function buildCoachPayloadFromStores(): TrackItCoachPayload {
  const profile = useGamificationStore.getState().profile;
  const level = profile?.level ?? useGamificationStore.getState().level ?? 1;
  const xp = profile?.xp ?? useGamificationStore.getState().xp ?? 0;
  const progress = useDashboardStore.getState().progress;
  const health = useHealthStore.getState();
  const finance = useDashboardStore.getState().finance;
  const schedule = useDashboardStore.getState().schedule;

  const categoryMap = Object.fromEntries(
    progress.categories.map((category) => [category.id, category.percent]),
  );

  return {
    user_profile: {
      level,
      xp,
      rank: getRankFromLevel(level),
      username: profile?.username,
    },
    stats: {
      discipline: categoryMap.discipline ?? 0,
      habits: categoryMap.habits ?? 0,
      mindset: categoryMap.mindset ?? 0,
      health: categoryMap.health ?? 0,
    },
    tasks_today: schedule.map((task) => ({
      title: task.title,
      completed: task.completed,
      time: task.time,
    })),
    habits_streaks: {},
    workout_logs: {
      last_session: health.lastSession?.title ?? null,
      volume_load_kg: Math.round(health.lifetimeStats.totalTonnageKg),
      streak_days: health.lifetimeStats.streakDays,
      total_workouts: health.lifetimeStats.totalWorkouts,
    },
    nutrition_logs: {
      calories_consumed: Math.round(health.consumedMacros.calories),
      target: health.dietPlan?.calories ?? DEFAULT_CALORIE_TARGET,
      macros: {
        P: Math.round(health.consumedMacros.protein),
        F: Math.round(health.consumedMacros.fat),
        C: Math.round(health.consumedMacros.carbs),
      },
    },
    finance_logs: {
      monthly_budget: finance.monthlyBudgetLimit,
      expenses_current: finance.monthlyExpense,
      income_current: finance.monthlyIncome,
      balance: finance.balance,
      display_currency: finance.displayCurrency,
      savings_goal: finance.activeGoal
        ? {
            name: finance.activeGoal.name,
            target: finance.activeGoal.targetAmount,
            saved: finance.activeGoal.savedAmount,
          }
        : null,
    },
  };
}

export function emptyCoachPayload(): TrackItCoachPayload {
  return emptyPayload();
}
