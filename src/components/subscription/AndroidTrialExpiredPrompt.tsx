import { useEffect } from 'react';

import { usePaywallStore } from '../../stores/usePaywallStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';

/**
 * Opens the paywall once when the native soft trial ends and the user is not Pro.
 * Subscribe-early CTA stays available during the trial via Profile / Premium.
 */
export function AndroidTrialExpiredPrompt() {
  const isReady = useSubscriptionStore((s) => s.isReady);
  const pending = useSubscriptionStore((s) => s.trialExpiredPromptPending);
  const consume = useSubscriptionStore((s) => s.consumeTrialExpiredPrompt);
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  useEffect(() => {
    if (!isReady || !pending) {
      return;
    }

    openPaywall();
    consume();
  }, [consume, isReady, openPaywall, pending]);

  return null;
}
