import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { RECENT_TEMPLATES_KEY } from '../constants/createHub';
import type { QuickActionId, RecentTemplate } from '../types/quickActions';

const MAX_TEMPLATES = 8;

export function useRecentTemplates(visible: boolean) {
  const [templates, setTemplates] = useState<RecentTemplate[]>([]);

  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_TEMPLATES_KEY);
      if (!raw) {
        setTemplates([]);
        return;
      }
      const parsed = JSON.parse(raw) as RecentTemplate[];
      setTemplates(Array.isArray(parsed) ? parsed.slice(0, MAX_TEMPLATES) : []);
    } catch {
      setTemplates([]);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void refresh();
    }
  }, [refresh, visible]);

  const recordTemplate = useCallback(
    async (actionId: QuickActionId, label: string, payload?: Record<string, unknown>) => {
      const entry: RecentTemplate = {
        id: `${actionId}-${Date.now()}`,
        actionId,
        label,
        payload,
        usedAt: new Date().toISOString(),
      };

      setTemplates((current) => {
        const deduped = current.filter(
          (item) => !(item.actionId === actionId && item.label === label),
        );
        const next = [entry, ...deduped].slice(0, MAX_TEMPLATES);
        void AsyncStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  return { templates, recordTemplate, refresh };
}
