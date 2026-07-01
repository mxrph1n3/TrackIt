import { useCallback, useEffect, useState } from 'react';

import {
  fetchJournalEntries,
  upsertJournalEntry,
  type JournalListItem,
} from '../lib/journal/journalService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';

export function useJournalEntries() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const [entries, setEntries] = useState<JournalListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await fetchJournalEntries(userId);
      setEntries(rows);
    } catch (error) {
      console.warn('[Journal] Failed to load entries:', error);
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel(`journal-list-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries', filter: `user_id=eq.${userId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  const saveEntry = useCallback(
    async (dayKey: string, body: string) => {
      if (!userId) {
        return;
      }
      await upsertJournalEntry(userId, dayKey, body);
      await refresh();
    },
    [refresh, userId],
  );

  return {
    entries,
    isLoading,
    refresh,
    saveEntry,
  };
}
