import type { FinanceTransaction, FinanceTrendPoint, FinanceTrendPeriod } from '../../types/finance';

function periodStart(period: FinanceTrendPeriod, reference = new Date()): Date {
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week':
      date.setDate(date.getDate() - 6);
      return date;
    case 'month':
      return new Date(date.getFullYear(), date.getMonth(), 1);
    case 'quarter': {
      const start = new Date(date);
      start.setMonth(start.getMonth() - 2, 1);
      return start;
    }
    case 'year':
      return new Date(date.getFullYear(), 0, 1);
    default:
      return date;
  }
}

export function computeFinanceTrend(
  transactions: FinanceTransaction[],
  period: FinanceTrendPeriod,
): FinanceTrendPoint[] {
  const start = periodStart(period);
  const buckets = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    const date = new Date(tx.occurredAt);
    if (date < start) continue;

    const key =
      period === 'year'
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    if (!buckets.has(key)) {
      buckets.set(key, { income: 0, expense: 0 });
    }

    const bucket = buckets.get(key)!;
    if (tx.type === 'income') bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, values]) => ({
      key,
      label:
        period === 'year'
          ? new Date(`${key}-01`).toLocaleDateString('en-US', { month: 'short' })
          : new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income: values.income,
      expense: values.expense,
      savings: values.income - values.expense,
    }));
}

export function computeAverageTicket(transactions: FinanceTransaction[], period: FinanceTrendPeriod): number {
  const start = periodStart(period);
  const expenses = transactions.filter(
    (tx) => tx.type === 'expense' && new Date(tx.occurredAt) >= start,
  );

  if (expenses.length === 0) return 0;
  return Math.round(expenses.reduce((sum, tx) => sum + tx.amount, 0) / expenses.length);
}

export { periodStart };
