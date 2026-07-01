import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { buildDashboardWorkoutSnapshot } from '../lib/health/workoutDashboard';
import { toDayKey } from '../utils/plannerDates';
import { useHealthStore } from '../stores/useHealthStore';

export function useDashboardWorkoutSnapshot() {
  const trackId = useHealthStore((s) => s.selectedTrackId);
  const week = useHealthStore((s) => s.selectedWeek);
  const lastSession = useHealthStore((s) => s.lastSession);
  const lifetimeStats = useHealthStore((s) => s.lifetimeStats);
  const [calendarKey, setCalendarKey] = useState(() => toDayKey(new Date()));

  useEffect(() => {
    const syncCalendar = () => setCalendarKey(toDayKey(new Date()));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncCalendar();
      }
    });
    return () => subscription.remove();
  }, []);

  return useMemo(
    () => buildDashboardWorkoutSnapshot(trackId, week, lastSession, lifetimeStats),
    [trackId, week, lastSession, lifetimeStats, calendarKey],
  );
}
