import { useCallback, useEffect, useState } from 'react';

import { fetchMissionRoadmap, type MissionRoadmapSnapshot } from '../lib/mission/roadmapService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';

const EMPTY_ROADMAP: MissionRoadmapSnapshot = {
  overallPercent: 0,
  milestones: [],
  isLive: false,
};

export function useMissionRoadmap() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const [snapshot, setSnapshot] = useState<MissionRoadmapSnapshot>(EMPTY_ROADMAP);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      setSnapshot(EMPTY_ROADMAP);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const next = await fetchMissionRoadmap(userId);
      setSnapshot(next);
    } catch (error) {
      console.warn('[MissionRoadmap] Failed to load roadmap:', error);
      setSnapshot(EMPTY_ROADMAP);
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
      .channel(`mission-roadmap-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'focus_sessions' }, () => {
        void refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        void refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  return {
    snapshot,
    isLoading,
    refresh,
  };
}
