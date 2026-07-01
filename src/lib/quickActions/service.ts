import { createHabit } from '../habits/service';
import { upsertDailyNutritionLog } from '../dashboard/metricsService';
import { appendQuickMeal } from '../health/nutritionService';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';
import type {
  CreateTaskInput,
  CreateTransactionInput,
  CreateWaterLogInput,
  TaskRow,
  TransactionRow,
  WaterLogRow,
} from '../../types/quickActionRecords';
import type { MealSlot } from '../../types/health';
import { addDays, parseDayKey, toDayKey } from '../../utils/plannerDates';

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

async function requireUserId(): Promise<string> {
  assertSupabaseConfigured();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('You must be signed in to save quick actions.');
  }

  return userId;
}

export async function insertTask(input: CreateTaskInput): Promise<TaskRow> {
  const userId = await requireUserId();
  const title = input.title.trim();

  if (!title) {
    throw new Error('Task title is required.');
  }

  const dueDate =
    input.dueDate ??
    (input.isToday !== false ? toDayKey(new Date()) : null);
  const isToday = dueDate === toDayKey(new Date());

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title,
      is_today: isToday,
      due_date: dueDate,
      scheduled_time: input.scheduledTime?.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as TaskRow;
}

export async function insertTransaction(
  input: CreateTransactionInput,
): Promise<TransactionRow> {
  const userId = await requireUserId();

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      label: input.label?.trim() || input.category,
      account_id: input.accountId ?? null,
      note: input.note?.trim() || null,
      occurred_at: input.occurredAt ?? new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as TransactionRow;
}

export async function insertWaterLog(input: CreateWaterLogInput): Promise<WaterLogRow> {
  const userId = await requireUserId();

  if (!Number.isInteger(input.amountMl) || input.amountMl <= 0) {
    throw new Error('Water amount must be a positive integer.');
  }

  const { data, error } = await supabase
    .from('water_logs')
    .insert({
      user_id: userId,
      amount_ml: input.amountMl,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as WaterLogRow;
}

export async function fetchWaterTotalForDay(userId: string, dayKey = toDayKey(new Date())): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0;
  }

  const dayStart = parseDayKey(dayKey);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = addDays(dayStart, 1);
  dayEnd.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('water_logs')
    .select('amount_ml')
    .eq('user_id', userId)
    .gte('logged_at', dayStart.toISOString())
    .lt('logged_at', dayEnd.toISOString());

  if (error) {
    if (isMissingSchemaError(error)) {
      return 0;
    }
    throw error;
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount_ml ?? 0), 0);
}

export function toQuickActionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong while saving your quick action.';
}

export async function insertHabit(title: string): Promise<void> {
  const userId = await requireUserId();
  await createHabit(userId, title);
}

export async function appendJournalNote(body: string): Promise<void> {
  const userId = await requireUserId();
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error('Note text is required.');
  }

  const dayKey = toDayKey(new Date());
  const { data: existing, error: fetchError } = await supabase
    .from('journal_entries')
    .select('body')
    .eq('user_id', userId)
    .eq('day_key', dayKey)
    .maybeSingle();

  if (fetchError && fetchError.code !== '42P01') {
    throw fetchError;
  }

  const mergedBody = existing?.body ? `${existing.body}\n\n${trimmed}` : trimmed;

  const { error } = await supabase.from('journal_entries').upsert(
    {
      user_id: userId,
      day_key: dayKey,
      body: mergedBody,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,day_key' },
  );

  if (error) {
    throw error;
  }
}

export async function logMealQuick(input: {
  slot: MealSlot;
  mealName: string;
  calories: number;
}): Promise<void> {
  const userId = await requireUserId();
  const trimmed = input.mealName.trim();
  if (!trimmed) {
    throw new Error('Meal name is required.');
  }

  if (!Number.isFinite(input.calories) || input.calories <= 0) {
    throw new Error('Calories must be greater than zero.');
  }

  await appendQuickMeal(userId, input.slot, trimmed, input.calories);
}
