import { getCategoryDef } from '../../constants/financeCategories';
import { resolveAccountBalance, resolveDisplayBalance } from './accountBalance';
import {
  aggregateBalancesByCurrency,
  DEFAULT_CURRENCY,
  resolveDisplayCurrency,
  resolveTransactionCurrency,
} from './currency';
import {
  buildFinanceGamificationMetrics,
  computeBalanceTrendPoints,
} from './gamification';
import { purgeLegacyMealExpenseTransactions, purgeLegacyWorkoutExpenseTransactions } from './ecosystem';
import type {
  DashboardFinanceGoal,
  DashboardFinanceReminder,
  DashboardFinanceSnapshot,
  DashboardFinanceTransaction,
} from '../../types/dashboard';
import { isSupabaseConfigured, supabase } from '../supabase';

type RawTransaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  label: string | null;
  account_id: string | null;
  occurred_at: string | null;
  created_at: string;
};

type RawAccount = {
  id: string;
  currency: string;
  is_default: boolean;
  balance: number | null;
};

type RawBudget = {
  category: string;
  monthly_limit: number;
};

type RawGoal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
};

type RawSubscription = {
  id: string;
  name: string;
  next_billing_date: string | null;
  is_active: boolean;
};

function monthStart(reference = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

function previousMonthStart(reference = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
}

function previousMonthEnd(reference = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 0, 23, 59, 59, 999);
}

function daysInMonth(reference = new Date()): number {
  return new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
}

function formatMonthLabel(reference = new Date()): string {
  const label = reference.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((todayStart.getTime() - txDayStart.getTime()) / 86_400_000);

  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 7) return `${dayDiff} days ago`;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function relativeBillingLabel(dateStr: string): { label: string; tone: DashboardFinanceReminder['tone'] } {
  const target = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const billingStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const dayDiff = Math.round((billingStart.getTime() - todayStart.getTime()) / 86_400_000);

  if (dayDiff === 0) return { label: 'Today', tone: 'today' };
  if (dayDiff === 1) return { label: 'Tomorrow', tone: 'soon' };
  if (dayDiff > 1 && dayDiff <= 7) return { label: `In ${dayDiff} days`, tone: 'soon' };
  return { label: target.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), tone: 'soon' };
}

function computeMonthlyTotals(
  transactions: RawTransaction[],
  start: Date,
  end?: Date,
  currencyFilter?: string,
  accountCurrencies?: Map<string, string>,
) {
  let income = 0;
  let expense = 0;

  for (const row of transactions) {
    const date = new Date(row.occurred_at ?? row.created_at);
    if (date < start) continue;
    if (end && date > end) continue;

    if (currencyFilter && accountCurrencies) {
      const txCurrency = resolveTransactionCurrency(
        row.account_id,
        accountCurrencies,
        currencyFilter,
      );
      if (txCurrency !== currencyFilter) continue;
    }

    const amount = Number(row.amount);
    if (row.type === 'income') income += amount;
    else expense += amount;
  }

  return { income, expense, delta: income - expense };
}

function mapRecentTransaction(row: RawTransaction): DashboardFinanceTransaction {
  const category = getCategoryDef(row.category);
  const timestamp = row.occurred_at ?? row.created_at;
  return {
    id: row.id,
    label: row.label ?? category.label,
    category: category.label,
    icon: category.icon,
    amount: row.type === 'expense' ? -Number(row.amount) : Number(row.amount),
    relativeLabel: relativeTime(timestamp),
  };
}

function pickActiveGoal(goals: RawGoal[]): DashboardFinanceGoal | null {
  if (goals.length === 0) return null;

  const sorted = [...goals].sort((a, b) => {
    const aPercent = Number(a.saved_amount) / Number(a.target_amount);
    const bPercent = Number(b.saved_amount) / Number(b.target_amount);
    return bPercent - aPercent;
  });

  const goal = sorted[0];
  const target = Number(goal.target_amount);
  const saved = Number(goal.saved_amount);
  const percent = Math.min(100, Math.round((saved / target) * 100));

  return {
    id: goal.id,
    name: goal.name,
    savedAmount: saved,
    targetAmount: target,
    percent,
    isComplete: percent >= 100,
  };
}

function pickReminder(subscriptions: RawSubscription[]): DashboardFinanceReminder | null {
  const active = subscriptions.filter((sub) => sub.is_active && sub.next_billing_date);
  if (active.length === 0) return null;

  const sorted = [...active].sort(
    (a, b) =>
      new Date(a.next_billing_date!).getTime() - new Date(b.next_billing_date!).getTime(),
  );

  const next = sorted[0];
  const { label, tone } = relativeBillingLabel(next.next_billing_date!);

  return {
    id: next.id,
    label: next.name,
    relativeLabel: label,
    tone,
  };
}

export function emptyDashboardFinance(cardholder = 'TRACKIT MEMBER'): DashboardFinanceSnapshot {
  return {
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
    monthLabel: formatMonthLabel(),
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
    cardholder,
    isEmpty: true,
    shieldStrengthPercent: 100,
    shieldStatus: 'no_budget',
    bossProgressPercent: 0,
    isVulnerable: false,
    financeXpMultiplier: 1,
    balanceTrendPoints: [],
  };
}

export async function fetchDashboardFinance(
  userId: string,
  cardholder = 'TRACKIT MEMBER',
): Promise<DashboardFinanceSnapshot> {
  const empty = emptyDashboardFinance(cardholder);

  if (!isSupabaseConfigured) {
    return empty;
  }

  await purgeLegacyWorkoutExpenseTransactions(userId);
  await purgeLegacyMealExpenseTransactions(userId);

  const [txResult, accountsResult, budgetsResult, goalsResult, subsResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('id, type, amount, category, label, account_id, occurred_at, created_at')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('finance_accounts')
      .select('id, currency, is_default, balance')
      .eq('user_id', userId),
    supabase.from('budgets').select('category, monthly_limit').eq('user_id', userId),
    supabase
      .from('finance_goals')
      .select('id, name, target_amount, saved_amount')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('finance_subscriptions')
      .select('id, name, next_billing_date, is_active')
      .eq('user_id', userId)
      .eq('is_active', true),
  ]);

  const transactions = (txResult.error ? [] : (txResult.data ?? [])) as RawTransaction[];
  const accounts = (accountsResult.error ? [] : (accountsResult.data ?? [])) as RawAccount[];
  const budgets = (budgetsResult.error ? [] : (budgetsResult.data ?? [])) as RawBudget[];
  const goals = (goalsResult.error ? [] : (goalsResult.data ?? [])) as RawGoal[];
  const subscriptions = (subsResult.error ? [] : (subsResult.data ?? [])) as RawSubscription[];

  const defaultAccountId = accounts.find((account) => account.is_default)?.id ?? accounts[0]?.id;

  const accountRows = accounts.map((account) => ({
    id: account.id,
    currency: account.currency,
    isDefault: account.is_default,
    balance: resolveAccountBalance(account.id, account.balance, transactions, {
      isDefault: account.id === defaultAccountId,
    }),
  }));
  const displayCurrency = resolveDisplayCurrency(accountRows);
  const balancesByCurrency = aggregateBalancesByCurrency(accountRows);
  const balance = resolveDisplayBalance({
    transactions,
    accounts: accountRows,
    displayCurrency,
  });
  const accountCurrencies = new Map(accounts.map((account) => [account.id, account.currency]));

  const now = new Date();
  const thisMonth = monthStart(now);
  const prevStart = previousMonthStart(now);
  const prevEnd = previousMonthEnd(now);
  const monthTotals = computeMonthlyTotals(
    transactions,
    thisMonth,
    undefined,
    displayCurrency,
    accountCurrencies,
  );
  const prevTotals = computeMonthlyTotals(
    transactions,
    prevStart,
    prevEnd,
    displayCurrency,
    accountCurrencies,
  );

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + Number(b.monthly_limit), 0);
  const hasBudget = totalBudgetLimit > 0;
  const monthlyBudgetLimit = totalBudgetLimit;
  const monthlyBudgetSpent = monthTotals.expense;
  const budgetUsedPercent = hasBudget
    ? Math.min(120, Math.round((monthTotals.expense / monthlyBudgetLimit) * 100))
    : 0;

  const estimatedPrevBalance = balance - monthTotals.delta;
  const balanceChangePercent =
    estimatedPrevBalance !== 0
      ? Math.round(((balance - estimatedPrevBalance) / Math.abs(estimatedPrevBalance)) * 100)
      : prevTotals.delta !== 0
        ? Math.round((monthTotals.delta / Math.abs(prevTotals.delta) - 1) * 100)
        : null;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySpent = transactions
    .filter((row) => {
      if (row.type !== 'expense') return false;
      if (new Date(row.occurred_at ?? row.created_at) < todayStart) return false;
      const txCurrency = resolveTransactionCurrency(
        row.account_id,
        accountCurrencies,
        displayCurrency,
      );
      return txCurrency === displayCurrency;
    })
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const perDayBudget = hasBudget ? monthlyBudgetLimit / daysInMonth(now) : 0;
  const budgetRemainingToday = hasBudget ? Math.max(0, Math.round(perDayBudget - todaySpent)) : 0;

  const latest = transactions[0];
  const latestCategory = latest ? getCategoryDef(latest.category) : null;
  const latestTimestamp = latest ? (latest.occurred_at ?? latest.created_at) : null;
  const recentTransactions = transactions.slice(0, 3).map(mapRecentTransaction);
  const hasActivity = transactions.length > 0 || balance !== 0;
  const activeGoal = pickActiveGoal(goals);
  const gamification = buildFinanceGamificationMetrics({
    monthlyExpense: monthTotals.expense,
    monthlyBudgetLimit,
    hasBudget,
    budgetUsedPercent,
    goalSaved: activeGoal?.savedAmount,
    goalTarget: activeGoal?.targetAmount,
  });
  const balanceTrendPoints = computeBalanceTrendPoints(
    transactions,
    balance,
    displayCurrency,
    accountCurrencies,
  );

  return {
    balance,
    displayCurrency,
    balancesByCurrency,
    hasBudget,
    monthlyDelta: monthTotals.delta,
    monthlyIncome: monthTotals.income,
    monthlyExpense: monthTotals.expense,
    budgetUsedPercent,
    monthlyBudgetLimit,
    monthlyBudgetSpent,
    balanceChangePercent,
    monthLabel: formatMonthLabel(now),
    todaySpent,
    budgetRemainingToday,
    lastTransactionLabel: latest?.label ?? latestCategory?.label ?? null,
    lastTransactionAmount: latest
      ? latest.type === 'expense'
        ? -Number(latest.amount)
        : Number(latest.amount)
      : null,
    lastTransactionIcon: latestCategory?.icon ?? null,
    lastTransactionRelative: latestTimestamp ? relativeTime(latestTimestamp) : null,
    lastTransactionCategory: latestCategory?.label ?? null,
    showLastTransaction: latest !== undefined,
    recentTransactions,
    activeGoal,
    reminder: pickReminder(subscriptions),
    hasIncome: monthTotals.income > 0,
    hasExpense: monthTotals.expense > 0,
    cardholder,
    isEmpty: !hasActivity,
    shieldStrengthPercent: gamification.shieldStrengthPercent,
    shieldStatus: gamification.shieldStatus,
    bossProgressPercent: gamification.bossProgressPercent,
    isVulnerable: gamification.isVulnerable,
    financeXpMultiplier: gamification.xpMultiplier,
    balanceTrendPoints,
  };
}
