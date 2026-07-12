import { create } from 'zustand';

import { IS_WEB } from '../lib/platform/constants';
import {
  configureSubscriptionService,
  fetchSubscriptionOfferings,
  fetchSubscriptionStatus,
  isNativeStoreBillingAvailable,
  purchaseSubscriptionProduct,
  restoreSubscriptionPurchases,
  syncSubscriptionUser,
} from '../lib/subscription/subscriptionService';
import { syncProStatusToServer } from '../lib/subscription/syncProStatus';
import {
  canSyncTmaAccess,
  createTelegramStarsInvoice,
  syncTmaAccess,
} from '../lib/subscription/tmaAccessService';
import { openTelegramStarsInvoice } from '../lib/telegram/starsPayment';
import type {
  SubscriptionOfferings,
  SubscriptionProductId,
  SubscriptionStatus,
} from '../types/subscription';
import { EMPTY_TMA_ACCESS, type TmaAccessStatus } from '../types/tmaAccess';

type SubscriptionState = {
  isReady: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;
  status: SubscriptionStatus;
  offerings: SubscriptionOfferings;
  tmaAccess: TmaAccessStatus;
  tmaAccessReady: boolean;
  devProOverride: boolean;
  initialize: (userId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  syncTma: () => Promise<TmaAccessStatus>;
  purchase: (productId: SubscriptionProductId) => Promise<boolean>;
  purchaseWithStars: () => Promise<boolean>;
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
  tmaAccess: EMPTY_TMA_ACCESS,
  tmaAccessReady: false,
  devProOverride: false,

  initialize: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      await configureSubscriptionService(userId);
      await syncSubscriptionUser(userId);

      const [status, offerings, tmaAccess] = await Promise.all([
        fetchSubscriptionStatus(),
        fetchSubscriptionOfferings(),
        userId && canSyncTmaAccess() ? syncTmaAccess() : Promise.resolve(EMPTY_TMA_ACCESS),
      ]);

      set({
        status,
        offerings,
        tmaAccess,
        tmaAccessReady: !canSyncTmaAccess() || Boolean(userId),
        isReady: true,
      });

      if (userId && status.isPro) {
        void syncProStatusToServer();
      }
    } catch (error) {
      console.warn('[SubscriptionStore] initialize failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Could not load subscription status.',
        isReady: true,
        tmaAccessReady: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    try {
      const [status, offerings, tmaAccess] = await Promise.all([
        fetchSubscriptionStatus(),
        fetchSubscriptionOfferings(),
        canSyncTmaAccess() ? syncTmaAccess() : Promise.resolve(get().tmaAccess),
      ]);
      set({ status, offerings, tmaAccess, error: null, tmaAccessReady: true });
    } catch (error) {
      console.warn('[SubscriptionStore] refresh failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Could not refresh subscription status.',
      });
    }
  },

  syncTma: async () => {
    if (!canSyncTmaAccess()) {
      return EMPTY_TMA_ACCESS;
    }

    const tmaAccess = await syncTmaAccess();
    set({ tmaAccess, tmaAccessReady: true });
    return tmaAccess;
  },

  purchase: async (productId) => {
    set({ isPurchasing: true, error: null });

    try {
      const status = await purchaseSubscriptionProduct(productId);
      set({ status, isPurchasing: false });
      if (status.isPro) {
        void syncProStatusToServer();
      }
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

  purchaseWithStars: async () => {
    set({ isPurchasing: true, error: null });

    try {
      const invoiceUrl = await createTelegramStarsInvoice();
      const result = await openTelegramStarsInvoice(invoiceUrl);

      if (result === 'paid') {
        const tmaAccess = await syncTmaAccess();
        set({
          tmaAccess,
          status: {
            ...get().status,
            isPro: true,
            expirationDate: tmaAccess.proExpiresAt,
          },
          isPurchasing: false,
        });
        return true;
      }

      if (result === 'cancelled') {
        set({ isPurchasing: false });
        return false;
      }

      set({
        error: 'Stars payment did not complete. Try again.',
        isPurchasing: false,
      });
      return false;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Stars payment failed.',
        isPurchasing: false,
      });
      return false;
    }
  },

  restore: async () => {
    set({ isPurchasing: true, error: null });

    try {
      const status = await restoreSubscriptionPurchases();
      const tmaAccess = canSyncTmaAccess() ? await syncTmaAccess() : get().tmaAccess;
      set({ status, tmaAccess, isPurchasing: false, tmaAccessReady: true });
      if (status.isPro) {
        void syncProStatusToServer();
      }
      return status.isPro || tmaAccess.hasFullAccess;
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
  if (IS_WEB && state.tmaAccess.hasFullAccess) {
    return true;
  }
  return state.status.isPro;
}

export function selectCanUseNotifications(state: SubscriptionState): boolean {
  if (__DEV__ && state.devProOverride) {
    return true;
  }
  if (IS_WEB && canSyncTmaAccess()) {
    return state.tmaAccess.canUseNotifications;
  }
  return selectIsPro(state);
}

export function useIsPro(): boolean {
  return useSubscriptionStore(selectIsPro);
}

export function useHasPremiumAccess(): boolean {
  return useIsPro();
}

export function useCanUseNotifications(): boolean {
  return useSubscriptionStore(selectCanUseNotifications);
}

export function isRevenueCatReady(): boolean {
  return isNativeStoreBillingAvailable();
}
