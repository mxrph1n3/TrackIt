import { create } from 'zustand';

import {
  configureSubscriptionService,
  fetchSubscriptionOfferings,
  fetchSubscriptionStatus,
  isRevenueCatConfigured,
  purchaseSubscriptionProduct,
  restoreSubscriptionPurchases,
  syncSubscriptionUser,
} from '../lib/subscription/subscriptionService';
import type {
  PremiumFeatureId,
  SubscriptionOfferings,
  SubscriptionProductId,
  SubscriptionStatus,
} from '../types/subscription';

type SubscriptionState = {
  isReady: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  status: SubscriptionStatus;
  offerings: SubscriptionOfferings;
  devProOverride: boolean;
  initialize: (userId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  purchase: (productId: SubscriptionProductId) => Promise<boolean>;
  restore: () => Promise<boolean>;
  setDevProOverride: (enabled: boolean) => void;
  clearError: () => void;
};

const DEFAULT_STATUS: SubscriptionStatus = {
  isPro: false,
  expirationDate: null,
  willRenew: false,
  productIdentifier: null,
  isSandbox: false,
};

const DEFAULT_OFFERINGS: SubscriptionOfferings = {
  monthly: null,
  yearly: null,
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isReady: false,
  isLoading: false,
  isPurchasing: false,
  error: null,
  status: DEFAULT_STATUS,
  offerings: DEFAULT_OFFERINGS,
  devProOverride: false,

  initialize: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      await configureSubscriptionService(userId);
      await syncSubscriptionUser(userId);

      const [status, offerings] = await Promise.all([
        fetchSubscriptionStatus(),
        fetchSubscriptionOfferings(),
      ]);

      set({ status, offerings, isReady: true });
    } catch (error) {
      console.warn('[SubscriptionStore] initialize failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Could not load subscription status.',
        isReady: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    try {
      const [status, offerings] = await Promise.all([
        fetchSubscriptionStatus(),
        fetchSubscriptionOfferings(),
      ]);
      set({ status, offerings, error: null });
    } catch (error) {
      console.warn('[SubscriptionStore] refresh failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Could not refresh subscription status.',
      });
    }
  },

  purchase: async (productId) => {
    set({ isPurchasing: true, error: null });

    try {
      const status = await purchaseSubscriptionProduct(productId);
      set({ status, isPurchasing: false });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed.';
      if (!message.toLowerCase().includes('cancel')) {
        set({ error: message });
      }
      set({ isPurchasing: false });
      return false;
    }
  },

  restore: async () => {
    set({ isPurchasing: true, error: null });

    try {
      const status = await restoreSubscriptionPurchases();
      set({ status, isPurchasing: false });
      return status.isPro;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Could not restore purchases.',
        isPurchasing: false,
      });
      return false;
    }
  },

  setDevProOverride: (enabled) => set({ devProOverride: enabled }),

  clearError: () => set({ error: null }),
}));

export function selectIsPro(state: SubscriptionState): boolean {
  if (__DEV__ && state.devProOverride) {
    return true;
  }
  return state.status.isPro;
}

export function useIsPro(): boolean {
  return useSubscriptionStore(selectIsPro);
}

export function useHasPremiumAccess(): boolean {
  return useIsPro();
}

export function isRevenueCatReady(): boolean {
  return isRevenueCatConfigured();
}
