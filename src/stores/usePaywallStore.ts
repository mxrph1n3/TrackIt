import { create } from 'zustand';

import { isAppFullyFree } from '../constants/appAccess';
import type { PremiumFeatureId } from '../types/subscription';

type PaywallState = {
  isOpen: boolean;
  feature: PremiumFeatureId | null;
  openPaywall: (feature?: PremiumFeatureId) => void;
  closePaywall: () => void;
};

export const usePaywallStore = create<PaywallState>((set) => ({
  isOpen: false,
  feature: null,
  openPaywall: (feature) => {
    if (isAppFullyFree()) {
      return;
    }
    set({ isOpen: true, feature: feature ?? null });
  },
  closePaywall: () => set({ isOpen: false, feature: null }),
}));
