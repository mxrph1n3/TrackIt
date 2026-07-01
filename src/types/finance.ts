/** Finance domain types — shared across screens and mini-forms. */

import type { CurrencyBalance } from '../lib/finance/currency';
import type { FinanceShieldStatus } from '../lib/finance/gamification';

export type TransactionType = 'income' | 'expense';

export type FinancialRating = 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C';

export type FinanceTransaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  categoryLabel: string;
  categoryIcon: string;
  label: string;
  accountId: string | null;
  accountName: string | null;
  note: string | null;
  occurredAt: string;
};

export type FinanceAccount = {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  balance: number;
  isDefault: boolean;
  lastChangeAmount: number | null;
  lastChangeLabel: string | null;
};

export type FinanceTrendPeriod = 'week' | 'month' | 'quarter' | 'year';

export type FinanceTrendPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  savings: number;
};

export type FinanceGoal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
  icon: string;
  color: string;
  percent: number;
};

export type FinanceSubscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingLabel: string;
};

export type ExpenseCategoryStat = {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  amount: number;
  color: string;
};

export type MetricDelta = {
  amount: number;
  changePercent: number;
};

export type FinanceOverview = {
  balance: number;
  displayCurrency: string;
  balancesByCurrency: CurrencyBalance[];
  hasBudget: boolean;
  monthlyDelta: number;
  balanceChangePercent: number;
  income: MetricDelta;
  expenses: MetricDelta;
  remaining: number;
  budgetSpentPercent: number;
  monthlyBudget: number;
  financialRating: FinancialRating;
  isBudgetBreached: boolean;
  accounts: FinanceAccount[];
  expenseCategories: ExpenseCategoryStat[];
  transactions: FinanceTransaction[];
  goals: FinanceGoal[];
  subscriptions: FinanceSubscription[];
  subscriptionsTotal: number;
  todaySpent: number;
  budgetRemainingToday: number;
  lastTransaction: FinanceTransaction | null;
  financeTips: string[];
  shieldStrengthPercent: number;
  shieldStatus: FinanceShieldStatus;
  bossProgressPercent: number;
  isVulnerable: boolean;
  financeXpMultiplier: number;
  balanceTrendPoints: number[];
  activeGoal: FinanceGoal | null;
};

/** @deprecated Use FinanceCategoryId from constants */
export type FinanceCategory = string;
