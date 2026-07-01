import { toDayKey } from '../../utils/plannerDates';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export type WeightTrendPoint = {
  dayKey: string;
  weightKg: number;
};

export async function logWeight(userId: string, weightKg: number, dayKey = toDayKey(new Date())): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 500) {
    throw new Error('Weight must be between 0 and 500 kg.');
  }

  const { error } = await supabase.from('weight_logs').upsert(
    {
      user_id: userId,
      weight_kg: Math.round(weightKg * 10) / 10,
      logged_on: dayKey,
      logged_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,logged_on' },
  );

  if (error) {
    if (isMissingSchemaError(error)) {
      throw new Error('Weight tracking is not available yet. Apply the latest database migrations.');
    }
    throw error;
  }
}

export async function fetchLatestWeight(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .select('weight_kg')
    .eq('user_id', userId)
    .order('logged_on', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return null;
    }
    throw error;
  }

  return data ? Number(data.weight_kg) : null;
}

export async function fetchWeightTrend(
  userId: string,
  startKey: string,
  endKey: string,
): Promise<WeightTrendPoint[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('weight_logs')
    .select('logged_on, weight_kg')
    .eq('user_id', userId)
    .gte('logged_on', startKey)
    .lte('logged_on', endKey)
    .order('logged_on', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) {
      return [];
    }
    throw error;
  }

  return (data ?? []).map((row) => ({
    dayKey: String(row.logged_on),
    weightKg: Number(row.weight_kg),
  }));
}
