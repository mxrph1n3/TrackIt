import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { touchAppOpen } from '../lib/notifications/activityTracking';
import { refreshTrackItNotifications } from '../lib/notifications/trackItNotificationService';
import { notificationsSupportedInRuntime } from '../lib/notifications/reminderService';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useNotificationSettingsStore } from '../stores/useNotificationSettingsStore';

function scheduleNotifications(
  enabled: boolean,
  hardcoreMode: boolean,
  userId: string | undefined,
  daysInactive?: number,
): void {
  void refreshTrackItNotifications({ enabled, hardcoreMode, userId, daysInactive }).catch((error) => {
    console.warn('[Notifications] Failed to refresh TrackIt notifications:', error);
  });
}

export function useReminderNotifications() {
  const userId = useGamificationStore((state) => state.profile?.id);
  const enabled = useNotificationSettingsStore((state) => state.enabled);
  const hardcoreMode = useNotificationSettingsStore((state) => state.hardcoreMode);
  const isReady = useNotificationSettingsStore((state) => state.isReady);
  const hydrate = useNotificationSettingsStore((state) => state.hydrate);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isReady || !notificationsSupportedInRuntime) {
      return;
    }

    void touchAppOpen().then(({ daysInactive }) => {
      scheduleNotifications(enabled, hardcoreMode, userId, daysInactive);
    });

    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = nextState;

      if (wasBackground && nextState === 'active') {
        void touchAppOpen().then(({ daysInactive }) => {
          scheduleNotifications(enabled, hardcoreMode, userId, daysInactive);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, hardcoreMode, isReady, userId]);
}
