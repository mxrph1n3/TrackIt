import { useCallback } from 'react';

import { navigationRef } from '../navigation/navigationRef';
import { useCreateHubStore } from '../stores/useCreateHubStore';
import { usePaywallStore } from '../stores/usePaywallStore';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useSideDrawerStore } from '../stores/useSideDrawerStore';

/** Handles Telegram back / hardware back for shell overlays before navigator pop. */
export function useShellBackNavigation() {
  const handleBack = useCallback((): boolean => {
    const hub = useCreateHubStore.getState();
    if (hub.isOpen) {
      hub.close();
      return true;
    }

    const paywall = usePaywallStore.getState();
    if (paywall.isOpen) {
      paywall.closePaywall();
      return true;
    }

    const drawer = useSideDrawerStore.getState();
    if (drawer.isOpen) {
      drawer.close();
      return true;
    }

    const profile = useProfileModuleStore.getState();
    if (profile.activeModule) {
      profile.closeModule();
      return true;
    }

    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
      return true;
    }

    return false;
  }, []);

  return handleBack;
}
