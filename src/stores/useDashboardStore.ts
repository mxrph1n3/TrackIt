import { create } from 'zustand';

import { DEFAULT_CURRENCY } from '../lib/finance/currency';

import type { DashboardFinanceSnapshot, DashboardProgress, ScheduleItem } from '../types/dashboard';

type DashboardState = {
  progress: DashboardProgress;
  schedule: ScheduleItem[];
  focusStreakDays: number;
  finance: DashboardFinanceSnapshot;
  addScheduleItem: (item: ScheduleItem) => void;
  setSchedule: (items: ScheduleItem[]) => void;
};

const EMPTY_FINANCE: DashboardFinanceSnapshot = {
  balance: 0,
  displayCurrency: DEFAULT_CURRENCY,
  balancesByCurrency: [],
  hasBudget: false,
  monthlyDelta: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  budgetUsedPercent: 0,
  monthlyBudgetLimit: 0,
  monthlyBudgetSpent: 0,
  balanceChangePercent: null,
  monthLabel: 'This month',
  todaySpent: 0,
  budgetRemainingToday: 0,
  lastTransactionLabel: null,
  lastTransactionAmount: null,
  lastTransactionIcon: null,
  lastTransactionRelative: null,
  lastTransactionCategory: null,
  showLastTransaction: false,
  recentTransactions: [],
  activeGoal: null,
  reminder: null,
  hasIncome: false,
  hasExpense: false,
  cardholder: 'TRACKIT MEMBER',
  isEmpty: true,
  shieldStrengthPercent: 100,
  shieldStatus: 'no_budget',
  bossProgressPercent: 0,
  isVulnerable: false,
  financeXpMultiplier: 1,
  balanceTrendPoints: [],
};

export const useDashboardStore = create<DashboardState>((set) => ({
  progress: {
    overall: 0,
    categories: [
      { id: 'discipline', label: 'Discipline', percent: 0, color: '#775DD8' },
      { id: 'habits', label: 'Habits', percent: 0, color: '#6366F1' },
      { id: 'mindset', label: 'Mindset', percent: 0, color: '#7C3AED' },
      { id: 'health', label: 'Health', percent: 0, color: '#5B21B6' },
    ],
  },
  schedule: [],
  focusStreakDays: 0,
  finance: EMPTY_FINANCE,
  addScheduleItem: (item) =>
    set((state) => ({
      schedule: [item, ...state.schedule],
    })),
  setSchedule: (items) => set({ schedule: items }),
}));

export { EMPTY_FINANCE };
