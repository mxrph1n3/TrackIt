import type {
  ExpenseCategoryStat,
  FinanceAccount,
  FinanceGoal,
  FinanceOverview,
  FinanceSubscription,
  FinanceTransaction,
  FinancialRating,
  MetricDelta,
} from '../../types/finance';
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
import { isSupabaseConfigured, supabase } from '../supabase';

type RawTransaction = {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  label: string | null;
  account_id: string | null;
  note: string | null;
  occurred_at: string | null;
  created_at: string;
};

type RawAccount = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  is_default: boolean;
  balance?: number | null;
  created_at: string;
};

type RawGoal = {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
};

type RawSubscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
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

export function calculateFinancialRating(
  budgetSpentPercent: number,
  monthlyDelta: number,
): FinancialRating {
  if (budgetSpentPercent >= 100) return 'C';
  if (budgetSpentPercent >= 95) return 'B';
  if (budgetSpentPercent >= 85) return 'B+';
  if (budgetSpentPercent >= 75) return 'A';
  if (budgetSpentPercent >= 60) return 'A+';
  if (monthlyDelta > 0) return 'S';
  return 'A+';
}

function mapTransaction(row: RawTransaction, accountNames: Map<string, string>): FinanceTransaction {
  const categoryDef = getCategoryDef(row.category);
  const timestamp = row.occurred_at ?? row.created_at;

  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    categoryLabel: categoryDef.label,
    categoryIcon: categoryDef.icon,
    label: row.label ?? categoryDef.label,
    accountId: row.account_id,
    accountName: row.account_id ? accountNames.get(row.account_id) ?? null : null,
    note: row.note,
    occurredAt: timestamp,
  };
}

function computeAccountLastChange(
  accountId: string | null,
  transactions: RawTransaction[],
): { amount: number | null; label: string | null } {
  const latest = transactions.find((row) =>
    accountId ? row.account_id === accountId : !row.account_id,
  );

  if (!latest) return { amount: null, label: null };

  const amount = Number(latest.amount);
  const signed = latest.type === 'income' ? amount : -amount;
  return {
    amount: signed,
    label: latest.label ?? getCategoryDef(latest.category).label,
  };
}

function computeCategoryStats(
  transactions: FinanceTransaction[],
  monthStartDate: Date,
): ExpenseCategoryStat[] {
  const expenseByCategory = new Map<string, number>();
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    const date = new Date(tx.occurredAt);
    if (date < monthStartDate) continue;

    totalExpense += tx.amount;
    expenseByCategory.set(tx.category, (expenseByCategory.get(tx.category) ?? 0) + tx.amount);
  }

  if (totalExpense <= 0) return [];

  return [...expenseByCategory.entries()]
    .map(([id, amount]) => {
      const def = getCategoryDef(id);
      return {
        id,
        name: def.label,
        icon: def.icon,
        percentage: Math.round((amount / totalExpense) * 100),
        amount,
        color: def.color,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
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

function changePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function fetchFinanceOverview(userId: string): Promise<FinanceOverview> {
  if (!isSupabaseConfigured) {
    return emptyFinanceOverview();
  }

  await purgeLegacyWorkoutExpenseTransactions(userId);
  await purgeLegacyMealExpenseTransactions(userId);

  const [txResult, accountsResult, budgetsResult, goalsResult, subsResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase.from('finance_accounts').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('budgets').select('category, monthly_limit').eq('user_id', userId),
    supabase.from('finance_goals').select('*').eq('user_id', userId).order('created_at'),
    supabase
      .from('finance_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_billing_date'),
  ]);

  const rawTransactions = (txResult.error ? [] : (txResult.data ?? [])) as RawTransaction[];
  const rawAccounts = (accountsResult.error ? [] : (accountsResult.data ?? [])) as RawAccount[];
  const rawBudgets = (budgetsResult.error ? [] : (budgetsResult.data ?? [])) as {
    category: string;
    monthly_limit: number;
  }[];
  const rawGoals = (goalsResult.error ? [] : (goalsResult.data ?? [])) as RawGoal[];
  const rawSubs = (subsResult.error ? [] : (subsResult.data ?? [])) as RawSubscription[];

  const accountNames = new Map(rawAccounts.map((a) => [a.id, a.name]));
  const accountCurrencies = new Map(rawAccounts.map((a) => [a.id, a.currency]));

  const now = new Date();
  const thisMonth = monthStart(now);
  const prevMonthStart = previousMonthStart(now);
  const prevMonthEnd = previousMonthEnd(now);

  const defaultAccountId = rawAccounts.find((account) => account.is_default)?.id ?? rawAccounts[0]?.id;

  const accounts: FinanceAccount[] =
    rawAccounts.length > 0
      ? rawAccounts.map((account) => {
          const lastChange = computeAccountLastChange(account.id, rawTransactions);
          return {
            id: account.id,
            name: account.name,
            icon: account.icon,
            color: account.color,
            currency: account.currency,
            balance: resolveAccountBalance(account.id, account.balance, rawTransactions, {
              isDefault: account.id === defaultAccountId,
            }),
            isDefault: account.is_default,
            lastChangeAmount: lastChange.amount,
            lastChangeLabel: lastChange.label,
          };
        })
      : [];

  const displayCurrency = resolveDisplayCurrency(accounts);
  const balancesByCurrency = aggregateBalancesByCurrency(accounts);
  const balance = resolveDisplayBalance({
    transactions: rawTransactions,
    accounts: accounts.map((account) => ({
      id: account.id,
      currency: account.currency,
      isDefault: account.isDefault,
      balance: account.balance,
    })),
    displayCurrency,
  });

  const thisMonthTotals = computeMonthlyTotals(
    rawTransactions,
    thisMonth,
    undefined,
    displayCurrency,
    accountCurrencies,
  );
  const prevMonthTotals = computeMonthlyTotals(
    rawTransactions,
    prevMonthStart,
    prevMonthEnd,
    displayCurrency,
    accountCurrencies,
  );

  const transactions = rawTransactions.map((row) => mapTransaction(row, accountNames));
  const expenseCategories = computeCategoryStats(transactions, thisMonth);

  const monthlyBudget = rawBudgets.reduce((sum, row) => sum + Number(row.monthly_limit), 0);
  const hasBudget = monthlyBudget > 0;
  const budgetSpentPercent = hasBudget
    ? Math.min(120, Math.round((thisMonthTotals.expense / monthlyBudget) * 100))
    : 0;

  const goals: FinanceGoal[] = rawGoals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    targetAmount: Number(goal.target_amount),
    savedAmount: Number(goal.saved_amount),
    targetDate: goal.target_date,
    icon: goal.icon,
    color: goal.color,
    percent: Math.min(
      100,
      Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100),
    ),
  }));

  const subscriptions: FinanceSubscription[] = rawSubs.map((sub) => ({
    id: sub.id,
    name: sub.name,
    amount: Number(sub.amount),
    currency: sub.currency,
    billingCycle: sub.billing_cycle as FinanceSubscription['billingCycle'],
    nextBillingLabel: sub.next_billing_date
      ? new Date(sub.next_billing_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : '—',
  }));

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySpent = transactions
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      if (new Date(tx.occurredAt) < todayStart) return false;
      const txCurrency = resolveTransactionCurrency(
        tx.accountId,
        accountCurrencies,
        displayCurrency,
      );
      return txCurrency === displayCurrency;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const dailyBudget = hasBudget ? monthlyBudget / 30 : 0;
  const budgetRemainingToday = hasBudget
    ? Math.max(0, dailyBudget * now.getDate() - todaySpent)
    : 0;

  const income: MetricDelta = {
    amount: thisMonthTotals.income,
    changePercent: changePercent(thisMonthTotals.income, prevMonthTotals.income),
  };

  const expenses: MetricDelta = {
    amount: thisMonthTotals.expense,
    changePercent: changePercent(thisMonthTotals.expense, prevMonthTotals.expense),
  };

  const monthlyDelta = thisMonthTotals.delta;
  const balanceChangePercent = changePercent(monthlyDelta, prevMonthTotals.delta);
  const activeGoal = goals.find((g) => g.percent > 0 && g.percent < 100) ?? goals[0] ?? null;
  const gamification = buildFinanceGamificationMetrics({
    monthlyExpense: thisMonthTotals.expense,
    monthlyBudgetLimit: monthlyBudget,
    hasBudget,
    budgetUsedPercent: budgetSpentPercent,
    goalSaved: activeGoal?.savedAmount,
    goalTarget: activeGoal?.targetAmount,
  });
  const balanceTrendPoints = computeBalanceTrendPoints(
    rawTransactions,
    balance,
    displayCurrency,
    accountCurrencies,
  );

  return {
    balance,
    displayCurrency,
    balancesByCurrency,
    hasBudget,
    monthlyDelta,
    balanceChangePercent,
    income,
    expenses,
    remaining: Math.max(0, thisMonthTotals.income - thisMonthTotals.expense),
    budgetSpentPercent,
    monthlyBudget,
    financialRating: calculateFinancialRating(budgetSpentPercent, monthlyDelta),
    isBudgetBreached: hasBudget && budgetSpentPercent >= 100,
    accounts,
    expenseCategories,
    transactions,
    goals,
    subscriptions,
    subscriptionsTotal: subscriptions.reduce((sum, s) => sum + s.amount, 0),
    todaySpent,
    budgetRemainingToday,
    lastTransaction: transactions[0] ?? null,
    financeTips: buildFinanceTips(thisMonthTotals, expenseCategories, goals),
    shieldStrengthPercent: gamification.shieldStrengthPercent,
    shieldStatus: gamification.shieldStatus,
    bossProgressPercent: gamification.bossProgressPercent,
    isVulnerable: gamification.isVulnerable,
    financeXpMultiplier: gamification.xpMultiplier,
    balanceTrendPoints,
    activeGoal,
  };
}

function buildFinanceTips(
  month: { income: number; expense: number; delta: number },
  categories: ExpenseCategoryStat[],
  goals: FinanceGoal[],
): string[] {
  const insights: string[] = [];

  if (month.expense > month.income && month.income > 0) {
    insights.push('Spending exceeded income this month — review discretionary categories.');
  }

  const top = categories[0];
  if (top && top.percentage >= 30) {
    insights.push(`${top.name} accounts for ${top.percentage}% of your expenses this month.`);
  }

  const nearestGoal = goals.find((g) => g.percent > 0 && g.percent < 100);
  if (nearestGoal && month.delta > 0) {
    const monthsLeft = Math.ceil(
      (nearestGoal.targetAmount - nearestGoal.savedAmount) / Math.max(month.delta, 1),
    );
    insights.push(
      `At your current pace, "${nearestGoal.name}" could be reached in ~${monthsLeft} months.`,
    );
  }

  if (insights.length === 0) {
    insights.push('Log transactions with [+] to unlock personalized spending tips.');
  }

  return insights;
}

export function emptyFinanceOverview(): FinanceOverview {
  return {
    balance: 0,
    displayCurrency: DEFAULT_CURRENCY,
    balancesByCurrency: [],
    hasBudget: false,
    monthlyDelta: 0,
    balanceChangePercent: 0,
    income: { amount: 0, changePercent: 0 },
    expenses: { amount: 0, changePercent: 0 },
    remaining: 0,
    budgetSpentPercent: 0,
    monthlyBudget: 0,
    financialRating: 'B',
    isBudgetBreached: false,
    accounts: [],
    expenseCategories: [],
    transactions: [],
    goals: [],
    subscriptions: [],
    subscriptionsTotal: 0,
    todaySpent: 0,
    budgetRemainingToday: 0,
    lastTransaction: null,
    financeTips: ['Log your first transaction with [+] to start tracking.'],
    shieldStrengthPercent: 100,
    shieldStatus: 'no_budget',
    bossProgressPercent: 0,
    isVulnerable: false,
    financeXpMultiplier: 1,
    balanceTrendPoints: [],
    activeGoal: null,
  };
}
