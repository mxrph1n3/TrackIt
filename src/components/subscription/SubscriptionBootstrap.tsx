import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '../../hooks/useAuth';
import {
  canUseAndroidTrial,
  shouldPromptAndroidTrialExpired,
} from '../../lib/subscription/androidTrialService';
import {
  selectAndroidTrial,
  useSubscriptionStore,
} from '../../stores/useSubscriptionStore';
import { useWorkoutLibraryStore } from '../../stores/useWorkoutLibraryStore';

async function recheckSoftTrialAfterExpiry(): Promise<void> {
  await useSubscriptionStore.getState().refresh();
  if (!canUseAndroidTrial()) {
    return;
  }
  if (useSubscriptionStore.getState().status.isPro) {
    return;
  }
  const shouldPrompt = await shouldPromptAndroidTrialExpired();
  if (shouldPrompt) {
    useSubscriptionStore.setState({ trialExpiredPromptPending: true });
  }
}

/** Loads RevenueCat customer info and local workout library when the user changes. */
export function SubscriptionBootstrap() {
  const user = useAuth().user;
  const initialize = useSubscriptionStore((s) => s.initialize);
  const hydrateWorkoutLibrary = useWorkoutLibraryStore((s) => s.hydrate);
  const trialEndsAt = useSubscriptionStore((s) => selectAndroidTrial(s).trialEndsAt);
  const isInTrial = useSubscriptionStore((s) => selectAndroidTrial(s).isInTrial);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    void initialize(user?.id ?? null);
    void hydrateWorkoutLibrary();
  }, [hydrateWorkoutLibrary, initialize, user?.id]);

  // Re-check soft trial + RevenueCat when returning to foreground.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const wasBackground = appState.current.match(/inactive|background/);
      appState.current = next;
      if (!wasBackground || next !== 'active') {
        return;
      }
      void recheckSoftTrialAfterExpiry();
    });

    return () => sub.remove();
  }, []);

  // Exact lock at trial end even if the app stays open the whole time.
  useEffect(() => {
    if (!canUseAndroidTrial() || !isInTrial || !trialEndsAt) {
      return;
    }

    const ms = new Date(trialEndsAt).getTime() - Date.now() + 250;
    if (ms <= 0) {
      void recheckSoftTrialAfterExpiry();
      return;
    }

    const timer = setTimeout(() => {
      void recheckSoftTrialAfterExpiry();
    }, ms);

    return () => clearTimeout(timer);
  }, [isInTrial, trialEndsAt]);

  return null;
}
