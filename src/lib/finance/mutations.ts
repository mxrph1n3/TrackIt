import { isSupabaseConfigured, supabase } from '../supabase';
import { DEFAULT_CURRENCY } from './currency';
import { MONTHLY_BUDGET_CATEGORY } from './budgetConstants';

async function requireUserId(): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('You must be signed in.');
  }

  return userId;
}

export async function createFinanceAccount(input: {
  name: string;
  icon?: string;
  color?: string;
  currency?: string;
}): Promise<void> {
  const userId = await requireUserId();
  const trimmed = input.name.trim();
  if (!trimmed) throw new Error('Account name is required.');

  const { error } = await supabase.from('finance_accounts').insert({
    user_id: userId,
    name: trimmed,
    icon: input.icon ?? 'credit-card',
    color: input.color ?? '#775DD8',
    currency: input.currency ?? DEFAULT_CURRENCY,
  });

  if (error) throw error;
}

export async function createFinanceGoal(input: {
  name: string;
  targetAmount: number;
  targetDate?: string;
  icon?: string;
}): Promise<void> {
  const userId = await requireUserId();
  const trimmed = input.name.trim();
  if (!trimmed) throw new Error('Goal name is required.');
  if (input.targetAmount <= 0) throw new Error('Target amount must be positive.');

  const { error } = await supabase.from('finance_goals').insert({
    user_id: userId,
    name: trimmed,
    target_amount: input.targetAmount,
    target_date: input.targetDate ?? null,
    icon: input.icon ?? 'target',
  });

  if (error) throw error;
}

export async function createFinanceSubscription(input: {
  name: string;
  amount: number;
  billingCycle?: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate?: string;
}): Promise<void> {
  const userId = await requireUserId();
  const trimmed = input.name.trim();
  if (!trimmed) throw new Error('Subscription name is required.');
  if (input.amount <= 0) throw new Error('Amount must be positive.');

  const { error } = await supabase.from('finance_subscriptions').insert({
    user_id: userId,
    name: trimmed,
    amount: input.amount,
    billing_cycle: input.billingCycle ?? 'monthly',
    next_billing_date: input.nextBillingDate ?? null,
  });

  if (error) throw error;
}

export async function insertFinanceTransaction(input: {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  label?: string;
  accountId?: string | null;
  note?: string;
  occurredAt?: string;
}): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase.from('transactions').insert({
    user_id: userId,
    type: input.type,
    amount: input.amount,
    category: input.category,
    label: input.label?.trim() || input.category,
    account_id: input.accountId ?? null,
    note: input.note?.trim() || null,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
  });

  if (error) throw error;
}

export async function upsertMonthlyBudget(monthlyLimit: number): Promise<void> {
  const userId = await requireUserId();
  if (monthlyLimit <= 0) {
    throw new Error('Monthly budget must be positive.');
  }

  const { error } = await supabase.from('budgets').upsert(
    {
      user_id: userId,
      category: MONTHLY_BUDGET_CATEGORY,
      monthly_limit: monthlyLimit,
    },
    { onConflict: 'user_id,category' },
  );

  if (error) throw error;
}

export async function deleteMonthlyBudget(): Promise<void> {
  const userId = await requireUserId();

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId)
    .eq('category', MONTHLY_BUDGET_CATEGORY);

  if (error) throw error;
}
