import type { Meal } from '../../types/health';
import { isSupabaseConfigured, supabase } from '../supabase';
import { DEFAULT_CURRENCY } from './currency';

export type EcosystemSourceType = 'task' | 'meal' | 'workout';

async function requireUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id ?? null;
}

export async function getOrCreateDefaultAccount(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const { data: existing } = await supabase
    .from('finance_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: anyAccount } = await supabase
    .from('finance_accounts')
    .select('id')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1)
    .maybeSingle();

  if (anyAccount?.id) return anyAccount.id;

  const { data: created, error } = await supabase
    .from('finance_accounts')
    .insert({
      user_id: userId,
      name: 'Primary Card',
      icon: 'credit-card',
      color: '#775DD8',
      currency: DEFAULT_CURRENCY,
      is_default: true,
    })
    .select('id')
    .single();

  if (error) {
    console.warn('[finance/ecosystem] create default account failed:', error.message);
    return null;
  }

  return created.id;
}

async function insertEcosystemTransaction(input: {
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  label: string;
  accountId: string | null;
  sourceType: EcosystemSourceType;
  sourceRef: string;
  note?: string;
}): Promise<boolean> {
  const { error } = await supabase.from('transactions').insert({
    user_id: input.userId,
    type: input.type,
    amount: input.amount,
    category: input.category,
    label: input.label,
    account_id: input.accountId,
    note: input.note ?? null,
    source_type: input.sourceType,
    source_ref: input.sourceRef,
    occurred_at: new Date().toISOString(),
  });

  if (error) {
    if (error.code === '23505') {
      return false;
    }
    console.warn('[finance/ecosystem] insert failed:', error.message);
    return false;
  }

  return true;
}

export async function recordMonetizedTaskIncome(taskId: string): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;

  const { data: task, error } = await supabase
    .from('tasks')
    .select('id, title, is_monetized, payout_amount, finance_category, completed')
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !task?.completed || !task.is_monetized) return;

  const payout = Number(task.payout_amount ?? 0);
  if (payout <= 0) return;

  const accountId = await getOrCreateDefaultAccount(userId);
  const category = (task.finance_category as string) || 'freelance';

  await insertEcosystemTransaction({
    userId,
    type: 'income',
    amount: payout,
    category,
    label: task.title,
    accountId,
    sourceType: 'task',
    sourceRef: taskId,
    note: 'Auto-recorded from completed task',
  });
}

export async function recordMealExpense(
  _meal: Meal,
  _slot: string,
  _dayKey = new Date().toISOString().slice(0, 10),
): Promise<void> {
  // Nutrition meals are recipe/macros tracking only — no automatic budget charge.
}

const purgedWorkoutExpenseUsers = new Set<string>();
const purgedMealExpenseUsers = new Set<string>();

export async function purgeLegacyWorkoutExpenseTransactions(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (purgedWorkoutExpenseUsers.has(userId)) return;

  purgedWorkoutExpenseUsers.add(userId);

  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .eq('source_type', 'workout');
}

export async function purgeLegacyMealExpenseTransactions(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  if (purgedMealExpenseUsers.has(userId)) return;

  purgedMealExpenseUsers.add(userId);

  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .eq('source_type', 'meal');
}

export async function recordWorkoutExpense(
  _sessionTitle: string,
  _dayKey = new Date().toISOString().slice(0, 10),
): Promise<void> {
  // Workouts are tracked for XP/health only — no automatic budget charge.
}

export async function reverseMonetizedTaskIncome(taskId: string): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;

  await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .eq('source_type', 'task')
    .eq('source_ref', taskId);
}
