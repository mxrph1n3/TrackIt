import type { FinanceCategory, TransactionType } from '../types/finance';

export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  is_today: boolean;
  due_date?: string | null;
  scheduled_time: string | null;
  completed: boolean;
  is_monetized?: boolean;
  payout_amount?: number | null;
  finance_category?: string | null;
  created_at: string;
};

export type TransactionRow = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: FinanceCategory | string;
  label: string | null;
  created_at: string;
};

export type WaterLogRow = {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
};

export type CreateTaskInput = {
  title: string;
  isToday?: boolean;
  dueDate?: string | null;
  scheduledTime?: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  label?: string;
  accountId?: string | null;
  note?: string;
  occurredAt?: string;
};

export type CreateWaterLogInput = {
  amountMl: number;
};

export const WATER_PRESETS_ML = [200, 300, 500, 750, 1000] as const;

export const QUICK_FINANCE_CATEGORIES = [
  'food',
  'transport',
  'cafe',
  'entertainment',
] as const satisfies readonly FinanceCategory[];

export type QuickFinanceCategory = (typeof QUICK_FINANCE_CATEGORIES)[number];

export const QUICK_FINANCE_CATEGORY_LABELS: Record<QuickFinanceCategory, string> = {
  food: 'Food',
  transport: 'Transport',
  cafe: 'Cafe',
  entertainment: 'Entertainment',
};
