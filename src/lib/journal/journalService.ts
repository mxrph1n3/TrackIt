import type { JournalEntryRow } from '../../types/database';
import { parseDayKey, toDayKey } from '../../utils/plannerDates';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export type JournalCategory = 'Mindset' | 'Health' | 'Motivation' | 'Reflection';

export type JournalListItem = {
  id: string;
  dayKey: string;
  body: string;
  category: JournalCategory;
  timeLabel: string;
  dateLabel: string;
  updatedAt: string;
};

const CATEGORY_RULES: Array<{ category: JournalCategory; pattern: RegExp }> = [
  { category: 'Health', pattern: /\b(workout|train|gym|run|health|sleep|nutrition|meal)\b/i },
  { category: 'Motivation', pattern: /\b(motivat|goal|dream|legacy|future|grateful)\b/i },
  { category: 'Mindset', pattern: /\b(focus|discipline|mindset|meditat|mental|calm)\b/i },
];

export function inferJournalCategory(body: string): JournalCategory {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(body)) {
      return rule.category;
    }
  }
  return 'Reflection';
}

function formatJournalDateLabel(dayKey: string, reference = new Date()): string {
  const todayKey = toDayKey(reference);
  const yesterday = new Date(reference);
  yesterday.setDate(reference.getDate() - 1);
  const yesterdayKey = toDayKey(yesterday);

  if (dayKey === todayKey) {
    return 'Today';
  }
  if (dayKey === yesterdayKey) {
    return 'Yesterday';
  }

  const date = parseDayKey(dayKey);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function mapJournalRow(row: JournalEntryRow, reference = new Date()): JournalListItem {
  const stamp = row.updated_at ?? row.created_at;
  return {
    id: row.id,
    dayKey: row.day_key,
    body: row.body,
    category: inferJournalCategory(row.body),
    timeLabel: new Date(stamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    dateLabel: formatJournalDateLabel(row.day_key, reference),
    updatedAt: stamp,
  };
}

export async function fetchJournalEntries(
  userId: string,
  limit = 60,
): Promise<JournalListItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('day_key', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingSchemaError(error)) {
      return [];
    }
    throw error;
  }

  return (data as JournalEntryRow[]).map((row) => mapJournalRow(row));
}

export { fetchJournalEntry, upsertJournalEntry } from '../planner/service';
