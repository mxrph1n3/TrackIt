export type ProgressCategory = {
  id: string;
  label: string;
  percent: number;
  color: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  time: string;
  completed: boolean;
};

export type DashboardFinanceTransaction = {
  id: string;
  label: string;
  category: string;
  icon: string;
  amount: number;
  relativeLabel: string;
};

export type DashboardFinanceGoal = {
  id: string;
  name: string;
  savedAmount: number;
  targetAmount: number;
  percent: number;
  isComplete: boolean;
};

export type DashboardFinanceReminder = {
  id: string;
  label: string;
  relativeLabel: string;
  tone: 'today' | 'soon' | 'savings';
};

import type { FinanceShieldStatus } from '../lib/finance/gamification';

export type DashboardFinanceSnapshot = {
  balance: number;
  displayCurrency: string;
  balancesByCurrency: { currency: string; balance: number }[];
  hasBudget: boolean;
  monthlyDelta: number;
  monthlyIncome: number;
  monthlyExpense: number;
  budgetUsedPercent: number;
  monthlyBudgetLimit: number;
  monthlyBudgetSpent: number;
  balanceChangePercent: number | null;
  monthLabel: string;
  todaySpent: number;
  budgetRemainingToday: number;
  lastTransactionLabel: string | null;
  lastTransactionAmount: number | null;
  lastTransactionIcon: string | null;
  lastTransactionRelative: string | null;
  lastTransactionCategory: string | null;
  showLastTransaction: boolean;
  recentTransactions: DashboardFinanceTransaction[];
  activeGoal: DashboardFinanceGoal | null;
  reminder: DashboardFinanceReminder | null;
  hasIncome: boolean;
  hasExpense: boolean;
  cardholder: string;
  isEmpty: boolean;
  shieldStrengthPercent: number;
  shieldStatus: FinanceShieldStatus;
  bossProgressPercent: number;
  isVulnerable: boolean;
  financeXpMultiplier: number;
  balanceTrendPoints: number[];
};

export type DashboardProgress = {
  overall: number;
  categories: ProgressCategory[];
};
