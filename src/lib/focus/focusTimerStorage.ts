import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FocusSessionType, FocusTimerStatus } from '../../types/focus';

const focusTimerKey = (userId: string) => `@trackit/focus_timer:${userId}`;

export type FocusTimerSnapshot = {
  sessionType: FocusSessionType;
  status: FocusTimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  savedAtMs: number;
};

export async function loadFocusTimerSnapshot(userId: string): Promise<FocusTimerSnapshot | null> {
  const raw = await AsyncStorage.getItem(focusTimerKey(userId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as FocusTimerSnapshot;
  } catch {
    return null;
  }
}

export async function saveFocusTimerSnapshot(
  userId: string,
  snapshot: FocusTimerSnapshot | null,
): Promise<void> {
  if (!snapshot || snapshot.status === 'idle' || snapshot.status === 'completed') {
    await AsyncStorage.removeItem(focusTimerKey(userId));
    return;
  }

  await AsyncStorage.setItem(focusTimerKey(userId), JSON.stringify(snapshot));
}
