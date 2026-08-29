import { create } from 'zustand';

import { isAppFullyFree } from '../constants/appAccess';
import { IS_WEB } from '../lib/platform/constants';
import {
  canUseAndroidTrial,
  computeAndroidTrialStatus,
  ensureAndroidTrialStarted,
  expireAndroidTrialNow,
  loadAndroidTrialStatus,
  markAndroidTrialExpiredPrompted,
  shouldPromptAndroidTrialExpired,
} from '../lib/subscription/androidTrialService';
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
import {
  EMPTY_ANDROID_TRIAL,
  type AndroidTrialStatus,
} from '../types/androidTrial';
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
  androidTrial: AndroidTrialStatus;
  /** One-shot soft paywall after Android trial expires. */
  trialExpiredPromptPending: boolean;
  devProOverride: boolean;
  initialize: (userId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  syncTma: () => Promise<TmaAccessStatus>;
  purchase: (productId: SubscriptionProductId) => Promise<boolean>;
  purchaseWithStars: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  consumeTrialExpiredPrompt: () => void;
  expireSoftTrial: () => Promise<void>;
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
  androidTrial: EMPTY_ANDROID_TRIAL,
  trialExpiredPromptPending: false,
  devProOverride: false,

  initialize: async (userId) => {
    if (isAppFullyFree()) {
      const syncedTma =
        userId && canSyncTmaAccess() ? await syncTmaAccess() : EMPTY_TMA_ACCESS;

      set({
        status: { ...DEFAULT_STATUS, isPro: true },
        offerings: DEFAULT_OFFERINGS,
        tmaAccess: {
          ...syncedTma,
          hasFullAccess: true,
          canUseNotifications: true,
        },
        tmaAccessReady: !canSyncTmaAccess() || Boolean(userId),
        androidTrial: EMPTY_ANDROID_TRIAL,
        trialExpiredPromptPending: false,
        isReady: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await configureSubscriptionService(userId);
      await syncSubscriptionUser(userId);

      const [status, offerings, tmaAccess, androidTrial, shouldPromptExpired] =
        await Promise.all([
          fetchSubscriptionStatus(),
          fetchSubscriptionOfferings(),
          userId && canSyncTmaAccess() ? syncTmaAccess() : Promise.resolve(EMPTY_TMA_ACCESS),
          canUseAndroidTrial() ? ensureAndroidTrialStarted() : Promise.resolve(EMPTY_ANDROID_TRIAL),
          canUseAndroidTrial() ? shouldPromptAndroidTrialExpired() : Promise.resolve(false),
        ]);

      set({
        status,
        offerings,
        tmaAccess,
        tmaAccessReady: !canSyncTmaAccess() || Boolean(userId),
        androidTrial,
        trialExpiredPromptPending: !status.isPro && shouldPromptExpired,
        isReady: true,
      });

      if (userId && status.isPro) {
        void syncProStatusToServer({
          isPro: status.isPro,
          expiresAt: status.expirationDate,
        });
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
    if (isAppFullyFree()) {
      const tmaAccess = canSyncTmaAccess() ? await syncTmaAccess() : get().tmaAccess;
      set({
        status: { ...get().status, isPro: true },
        tmaAccess: {
          ...tmaAccess,
          hasFullAccess: true,
          canUseNotifications: true,
        },
        error: null,
        tmaAccessReady: true,
      });
      return;
    }

    try {
      const [status, offerings, tmaAccess, androidTrial] = await Promise.all([
        fetchSubscriptionStatus(),
        fetchSubscriptionOfferings(),
        canSyncTmaAccess() ? syncTmaAccess() : Promise.resolve(get().tmaAccess),
        canUseAndroidTrial() ? loadAndroidTrialStatus() : Promise.resolve(EMPTY_ANDROID_TRIAL),
      ]);
      set({
        status,
        offerings,
        tmaAccess,
        androidTrial,
        trialExpiredPromptPending:
          status.isPro || !androidTrial.isExpired ? false : get().trialExpiredPromptPending,
        error: null,
        tmaAccessReady: true,
      });
    } catch (error) {
      console.warn('[SubscriptionStore] refresh failed:', error);
      set({
        error: error instanceof Error ? error.message : 'Could not refresh subscription status.',
      });
    }
  },

  syncTma: async () => {
    if (!canSyncTmaAccess()) {
      return get().tmaAccess;
    }

    const tmaAccess = await syncTmaAccess();
    const merged = isAppFullyFree()
      ? { ...tmaAccess, hasFullAccess: true, canUseNotifications: true }
      : tmaAccess;
    set({ tmaAccess: merged, tmaAccessReady: true });
    return merged;
  },

  purchase: async (productId) => {
    if (isAppFullyFree()) {
      return false;
    }
    set({ isPurchasing: true, error: null });

    try {
      const status = await purchaseSubscriptionProduct(productId);
      set({
        status,
        isPurchasing: false,
        trialExpiredPromptPending: status.isPro ? false : get().trialExpiredPromptPending,
      });
      if (status.isPro) {
        void syncProStatusToServer({
          isPro: status.isPro,
          expiresAt: status.expirationDate,
        });
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
    if (isAppFullyFree()) {
      return false;
    }
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
          trialExpiredPromptPending: false,
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
    if (isAppFullyFree()) {
      return true;
    }
    set({ isPurchasing: true, error: null });

    try {
      const status = await restoreSubscriptionPurchases();
      const tmaAccess = canSyncTmaAccess() ? await syncTmaAccess() : get().tmaAccess;
      set({
        status,
        tmaAccess,
        isPurchasing: false,
        tmaAccessReady: true,
        trialExpiredPromptPending: status.isPro ? false : get().trialExpiredPromptPending,
      });
      if (status.isPro) {
        void syncProStatusToServer({
          isPro: status.isPro,
          expiresAt: status.expirationDate,
        });
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

  consumeTrialExpiredPrompt: () => {
    void markAndroidTrialExpiredPrompted();
    set({ trialExpiredPromptPending: false });
  },

  expireSoftTrial: async () => {
    if (!canUseAndroidTrial()) {
      return;
    }
    const androidTrial = await expireAndroidTrialNow();
    set({
      androidTrial,
      trialExpiredPromptPending: androidTrial.isExpired,
    });
  },

  setDevProOverride: (enabled) => set({ devProOverride: enabled }),

  clearError: () => set({ error: null }),
}));

/**
 * Live soft-trial check (wall clock vs trialEndsAt).
 * Do not trust cached `androidTrial.isInTrial` alone — app can stay open past expiry.
 */
function androidTrialStatusEqual(a: AndroidTrialStatus, b: AndroidTrialStatus): boolean {
  return (
    a.started === b.started &&
    a.isInTrial === b.isInTrial &&
    a.isExpired === b.isExpired &&
    a.trialDaysRemaining === b.trialDaysRemaining &&
    a.trialStartedAt === b.trialStartedAt &&
    a.trialEndsAt === b.trialEndsAt
  );
}

/** Last live snapshot — selectors must be referentially stable for Zustand. */
let lastLiveAndroidTrial: AndroidTrialStatus = EMPTY_ANDROID_TRIAL;

function selectLiveAndroidTrial(state: SubscriptionState): AndroidTrialStatus {
  if (!canUseAndroidTrial()) {
    return EMPTY_ANDROID_TRIAL;
  }
  const live = computeAndroidTrialStatus(state.androidTrial.trialStartedAt);
  if (androidTrialStatusEqual(live, state.androidTrial)) {
    lastLiveAndroidTrial = state.androidTrial;
    return state.androidTrial;
  }
  if (androidTrialStatusEqual(live, lastLiveAndroidTrial)) {
    return lastLiveAndroidTrial;
  }
  lastLiveAndroidTrial = live;
  return live;
}

function selectHasAndroidTrialAccess(state: SubscriptionState): boolean {
  if (!canUseAndroidTrial() || state.status.isPro) {
    return false;
  }
  return selectLiveAndroidTrial(state).isInTrial;
}

export function selectIsPro(state: SubscriptionState): boolean {
  if (isAppFullyFree()) {
    return true;
  }
  if (__DEV__ && state.devProOverride) {
    return true;
  }
  if (IS_WEB && state.tmaAccess.hasFullAccess) {
    return true;
  }
  if (selectHasAndroidTrialAccess(state)) {
    return true;
  }
  return state.status.isPro;
}

/** Paid Pro — excludes trial-only so users can subscribe early. */
export function selectHasPaidPro(state: SubscriptionState): boolean {
  if (isAppFullyFree()) {
    return true;
  }
  if (__DEV__ && state.devProOverride) {
    return true;
  }
  if (IS_WEB && canSyncTmaAccess()) {
    if (state.tmaAccess.hasStarsSubscription) {
      return true;
    }
    if (state.tmaAccess.isInTrial) {
      return false;
    }
    return state.status.isPro;
  }
  return state.status.isPro;
}

export function selectAndroidTrial(state: SubscriptionState): AndroidTrialStatus {
  return selectLiveAndroidTrial(state);
}

export function selectCanUseNotifications(state: SubscriptionState): boolean {
  if (isAppFullyFree()) {
    return true;
  }
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

/** Native App Store / Play Billing available (no third-party billing SDK). */
export function isStoreBillingReady(): boolean {
  if (isAppFullyFree()) {
    return false;
  }
  return isNativeStoreBillingAvailable();
}

/** @deprecated Use isStoreBillingReady */
export function isRevenueCatReady(): boolean {
  return isStoreBillingReady();
}
