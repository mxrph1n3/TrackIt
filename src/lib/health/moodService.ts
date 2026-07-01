import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';
import { toDayKey } from '../../utils/plannerDates';

export type MoodLogRow = {
  id: string;
  user_id: string;
  mood_score: number;
  note: string | null;
  logged_on: string;
  logged_at: string;
};

export async function insertMoodLog(moodScore: number, note?: string): Promise<MoodLogRow> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5) {
    throw new Error('Mood score must be between 1 and 5.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('You must be signed in to log mood.');
  }

  const trimmedNote = note?.trim() || null;

  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      user_id: userId,
      mood_score: moodScore,
      note: trimmedNote,
      logged_on: toDayKey(new Date()),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as MoodLogRow;
}

export async function fetchLatestMoodScore(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('mood_logs')
    .select('mood_score')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return null;
    }
    throw error;
  }

  return data?.mood_score ?? null;
}
