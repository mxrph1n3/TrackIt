import { useCallback } from 'react';

import { PREMIUM_FEATURE_META } from '../lib/subscription/features';
import { usePaywallStore } from '../stores/usePaywallStore';
import { selectIsPro, useSubscriptionStore } from '../stores/useSubscriptionStore';
import type { PremiumFeatureId } from '../types/subscription';

type FeatureGateResult = {
  isPro: boolean;
  featureTitle: string;
  featureDescription: string;
  /** Runs action when Pro is active; otherwise opens the paywall. */
  requirePro: (action: () => void) => void;
  openPaywall: () => void;
};

export function useFeatureGate(feature: PremiumFeatureId): FeatureGateResult {
  const isPro = useSubscriptionStore(selectIsPro);
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const meta = PREMIUM_FEATURE_META[feature];

  const openFeaturePaywall = useCallback(() => {
    openPaywall(feature);
  }, [feature, openPaywall]);

  const requirePro = useCallback(
    (action: () => void) => {
      if (isPro) {
        action();
        return;
      }
      openFeaturePaywall();
    },
    [isPro, openFeaturePaywall],
  );

  return {
    isPro,
    featureTitle: meta.title,
    featureDescription: meta.description,
    requirePro,
    openPaywall: openFeaturePaywall,
  };
}

export function usePremiumAction() {
  const isPro = useSubscriptionStore(selectIsPro);
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  return useCallback(
    (feature: PremiumFeatureId, action: () => void) => {
      if (isPro) {
        action();
        return;
      }
      openPaywall(feature);
    },
    [isPro, openPaywall],
  );
}
