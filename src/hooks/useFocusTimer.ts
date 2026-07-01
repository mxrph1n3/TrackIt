import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  loadFocusTimerSnapshot,
  saveFocusTimerSnapshot,
} from '../lib/focus/focusTimerStorage';
import { recordFocusSession } from '../lib/focus/service';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { useProgression } from './useProgression';
import {
  FOCUS_MODE_PRESETS,
  type FocusSessionType,
  type FocusTimerStatus,
} from '../types/focus';
import { MOTION_DURATION, timingLoop, timingStandard } from '../theme/motion';
import { useGamificationStore } from '../stores/useGamificationStore';

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useFocusTimer() {
  const userId = useGamificationStore((s) => s.profile?.id);
  const syncProfile = useGamificationStore((s) => s.syncProfile);
  const { awardXp } = useProgression();

  const [sessionType, setSessionType] = useState<FocusSessionType>('focus');
  const [status, setStatus] = useState<FocusTimerStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(
    FOCUS_MODE_PRESETS[0].durationSeconds,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSecondsRef = useRef(FOCUS_MODE_PRESETS[0].durationSeconds);
  const statusRef = useRef<FocusTimerStatus>('idle');
  const sessionTypeRef = useRef<FocusSessionType>('focus');
  const remainingSecondsRef = useRef(FOCUS_MODE_PRESETS[0].durationSeconds);

  const crystalScale = useSharedValue(1);
  const ringProgress = useSharedValue(1);

  const preset = FOCUS_MODE_PRESETS.find((item) => item.id === sessionType) ?? FOCUS_MODE_PRESETS[0];

  statusRef.current = status;
  sessionTypeRef.current = sessionType;
  remainingSecondsRef.current = remainingSeconds;

  const persistSnapshot = useCallback(async () => {
    if (!userId) {
      return;
    }

    await saveFocusTimerSnapshot(userId, {
      sessionType: sessionTypeRef.current,
      status: statusRef.current,
      remainingSeconds: remainingSecondsRef.current,
      totalSeconds: totalSecondsRef.current,
      savedAtMs: Date.now(),
    });
  }, [userId]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetForPreset = useCallback(
    (type: FocusSessionType) => {
      clearTimer();
      const nextPreset = FOCUS_MODE_PRESETS.find((item) => item.id === type) ?? FOCUS_MODE_PRESETS[0];
      totalSecondsRef.current = nextPreset.durationSeconds;
      setSessionType(type);
      setRemainingSeconds(nextPreset.durationSeconds);
      setStatus('idle');
      ringProgress.value = 1;
      crystalScale.value = 1;
    },
    [clearTimer, crystalScale, ringProgress],
  );

  const startBreathing = useCallback(() => {
    crystalScale.value = withRepeat(
      withSequence(
        withTiming(1.08, timingLoop(1800)),
        withTiming(0.96, timingLoop(1800)),
      ),
      -1,
      true,
    );
  }, [crystalScale]);

  const stopBreathing = useCallback(() => {
    crystalScale.value = withTiming(1, timingStandard());
  }, [crystalScale]);

  const completeSession = useCallback(async () => {
    clearTimer();
    setStatus('completed');
    stopBreathing();

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!userId) {
      return;
    }

    try {
      await recordFocusSession(userId, sessionTypeRef.current, totalSecondsRef.current);

      if (sessionTypeRef.current === 'focus') {
        await awardXp('FOCUS_SESSION_30MIN');
      }

      await syncProfile();
      await saveFocusTimerSnapshot(userId, null);
    } catch (error) {
      reportSyncError('Focus', error, 'Could not save focus session.');
    }
  }, [awardXp, clearTimer, stopBreathing, syncProfile, userId]);

  const tick = useCallback(() => {
    setRemainingSeconds((prev) => {
      const next = prev - 1;
      ringProgress.value = next / totalSecondsRef.current;

      if (next <= 0) {
        void completeSession();
        return 0;
      }

      return next;
    });
  }, [completeSession, ringProgress]);

  const start = useCallback(() => {
    if (statusRef.current === 'running') {
      return;
    }

    setStatus('running');
    startBreathing();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(tick, 1000);
  }, [startBreathing, tick]);

  const pause = useCallback(() => {
    clearTimer();
    setStatus('paused');
    stopBreathing();
  }, [clearTimer, stopBreathing]);

  const reset = useCallback(() => {
    resetForPreset(sessionTypeRef.current);
  }, [resetForPreset]);

  useEffect(() => {
    if (!userId) {
      setIsHydrated(true);
      return;
    }

    let cancelled = false;

    void loadFocusTimerSnapshot(userId).then((snapshot) => {
      if (cancelled || !snapshot) {
        setIsHydrated(true);
        return;
      }

      totalSecondsRef.current = snapshot.totalSeconds;
      setSessionType(snapshot.sessionType);
      setStatus(snapshot.status);

      if (snapshot.status === 'running') {
        const elapsedSeconds = Math.floor((Date.now() - snapshot.savedAtMs) / 1000);
        const nextRemaining = Math.max(0, snapshot.remainingSeconds - elapsedSeconds);
        setRemainingSeconds(nextRemaining);
        ringProgress.value = nextRemaining / snapshot.totalSeconds;

        if (nextRemaining <= 0) {
          void completeSession();
        } else {
          intervalRef.current = setInterval(tick, 1000);
          startBreathing();
        }
      } else {
        setRemainingSeconds(snapshot.remainingSeconds);
        ringProgress.value = snapshot.remainingSeconds / snapshot.totalSeconds;
      }

      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [completeSession, ringProgress, startBreathing, tick, userId]);

  useEffect(() => {
    if (!userId || !isHydrated) {
      return;
    }

    void persistSnapshot();
  }, [isHydrated, persistSnapshot, remainingSeconds, status, sessionType, userId]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (userId) {
        void persistSnapshot();
      }
    };
  }, [clearTimer, persistSnapshot, userId]);

  const crystalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crystalScale.value }],
  }));

  const progressPercent = remainingSeconds / totalSecondsRef.current;

  return {
    sessionType,
    status,
    remainingSeconds,
    formattedTime: formatTimer(remainingSeconds),
    progressPercent,
    ringProgress,
    crystalAnimatedStyle,
    preset,
    setSessionType: resetForPreset,
    start,
    pause,
    reset,
  };
}
