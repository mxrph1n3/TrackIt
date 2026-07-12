import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDayKey } from '../utils/plannerDates';

/** Tracks the local calendar day; updates when the app returns to foreground or the day rolls over. */
export function useCalendarDayKey(): string {
  const [dayKey, setDayKey] = useState(() => toDayKey(new Date()));

  useEffect(() => {
    const sync = () => {
      const next = toDayKey(new Date());
      setDayKey((current) => (current === next ? current : next));
    };

    sync();
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync();
      }
    });

    const interval = setInterval(sync, 60_000);

    return () => {
      appStateSub.remove();
      clearInterval(interval);
    };
  }, []);

  return dayKey;
}
