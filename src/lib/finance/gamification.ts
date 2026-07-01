/** RPG finance gamification — Shield (budget) & Boss (savings goal) mechanics. */

export type FinanceShieldStatus = 'on_track' | 'at_risk' | 'vulnerable' | 'no_budget';

export type FinanceGamificationMetrics = {
  shieldStrengthPercent: number;
  shieldStatus: FinanceShieldStatus;
  bossProgressPercent: number;
  isVulnerable: boolean;
  xpMultiplier: number;
};

export const SHIELD_STATUS_LABELS: Record<FinanceShieldStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  vulnerable: 'Vulnerable',
  no_budget: 'No Budget',
};

export const SHIELD_STATUS_COLORS: Record<FinanceShieldStatus, string> = {
  on_track: '#34D399',
  at_risk: '#F59E0B',
  vulnerable: '#F87171',
  no_budget: '#94A3B8',
};

/** FSC = max(0, (1 - Expenses/Budget) × 100%) */
export function computeFinancialShieldCoef(expenses: number, budgetTarget: number): number {
  if (budgetTarget <= 0) return 100;
  return Math.max(0, Math.round((1 - expenses / budgetTarget) * 100));
}

/** SBD = (Savings / Goal) × 100% */
export function computeSavingsBossDamage(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((saved / target) * 100));
}

export function resolveShieldStatus(
  fsc: number,
  hasBudget: boolean,
  budgetUsedPercent: number,
): FinanceShieldStatus {
  if (!hasBudget) return 'no_budget';
  if (budgetUsedPercent >= 100 || fsc <= 15) return 'vulnerable';
  if (budgetUsedPercent >= 85 || fsc <= 30) return 'at_risk';
  return 'on_track';
}

/** −25% XP from workouts & focus when shield is cracked (FSC ≤ 15%). */
export function financeXpMultiplier(fsc: number, hasBudget: boolean): number {
  if (!hasBudget) return 1;
  if (fsc <= 15) return 0.75;
  return 1;
}

export function isFinanceVulnerableDebuffAction(actionName: string): boolean {
  return actionName === 'workout_completed' || actionName === 'focus_session';
}

/** XP_earned = BaseXP × (1 + Savings_daily / Budget_daily) */
export function computeFinanceDisciplineXp(
  baseXp: number,
  dailySavings: number,
  dailyBudget: number,
): number {
  if (dailyBudget <= 0) return baseXp;
  return Math.round(baseXp * (1 + dailySavings / dailyBudget));
}

export function buildFinanceGamificationMetrics(input: {
  monthlyExpense: number;
  monthlyBudgetLimit: number;
  hasBudget: boolean;
  budgetUsedPercent: number;
  goalSaved?: number;
  goalTarget?: number;
}): FinanceGamificationMetrics {
  const shieldStrengthPercent = computeFinancialShieldCoef(
    input.monthlyExpense,
    input.monthlyBudgetLimit,
  );
  const shieldStatus = resolveShieldStatus(
    shieldStrengthPercent,
    input.hasBudget,
    input.budgetUsedPercent,
  );
  const bossProgressPercent = computeSavingsBossDamage(
    input.goalSaved ?? 0,
    input.goalTarget ?? 0,
  );
  const isVulnerable = shieldStatus === 'vulnerable';
  const xpMultiplier = financeXpMultiplier(shieldStrengthPercent, input.hasBudget);

  return {
    shieldStrengthPercent,
    shieldStatus,
    bossProgressPercent,
    isVulnerable,
    xpMultiplier,
  };
}

type TrendTransaction = {
  type: 'income' | 'expense';
  amount: number;
  account_id?: string | null;
  occurred_at?: string | null;
  created_at: string;
};

/** Last N days of end-of-day balance for sparkline charts. */
export function computeBalanceTrendPoints(
  transactions: TrendTransaction[],
  currentBalance: number,
  displayCurrency: string,
  accountCurrencies: Map<string, string>,
  days = 7,
): number[] {
  const resolveCurrency = (accountId: string | null | undefined): string => {
    if (!accountId) return displayCurrency;
    return accountCurrencies.get(accountId) ?? displayCurrency;
  };

  const netDeltaAfter = (cutoff: Date): number => {
    let delta = 0;
    for (const row of transactions) {
      const timestamp = row.occurred_at ?? row.created_at;
      if (new Date(timestamp) <= cutoff) continue;
      if (resolveCurrency(row.account_id) !== displayCurrency) continue;
      const amount = Number(row.amount);
      delta += row.type === 'income' ? amount : -amount;
    }
    return delta;
  };

  const points: number[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayEnd = new Date(now);
    dayEnd.setDate(dayEnd.getDate() - i);
    dayEnd.setHours(23, 59, 59, 999);
    points.push(currentBalance - netDeltaAfter(dayEnd));
  }

  return points;
}
