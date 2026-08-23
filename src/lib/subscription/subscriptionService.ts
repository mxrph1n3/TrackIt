import { Platform } from 'react-native';

import {
  SUBSCRIPTION_DISPLAY_PRICING,
  SUBSCRIPTION_PRODUCT_IDS,
} from '../../constants/subscriptions';
import { NATIVE_STORE_PACKAGE_ID } from '../../constants/legal';
import { IS_WEB } from '../platform/constants';
import { syncProStatusToServer } from './syncProStatus';
import type {
  SubscriptionOfferings,
  SubscriptionPackage,
  SubscriptionProductId,
  SubscriptionStatus,
} from '../../types/subscription';

const PRODUCT_IDS = [
  SUBSCRIPTION_PRODUCT_IDS.monthly,
  SUBSCRIPTION_PRODUCT_IDS.yearly,
] as const;

type ExpoIapModule = typeof import('expo-iap');
type ProductSubscription = import('expo-iap').ProductSubscription;
type Purchase = import('expo-iap').Purchase;
type ActiveSubscription = import('expo-iap').ActiveSubscription;

let iapModule: ExpoIapModule | null = null;
let iapLoadAttempted = false;
let connectionPromise: Promise<boolean> | null = null;

function emptyStatus(): SubscriptionStatus {
  return {
    isPro: false,
    expirationDate: null,
    willRenew: false,
    productIdentifier: null,
    isSandbox: false,
  };
}

function fallbackPackage(productId: SubscriptionProductId): SubscriptionPackage {
  if (productId === SUBSCRIPTION_PRODUCT_IDS.yearly) {
    return {
      identifier: productId,
      priceString: SUBSCRIPTION_DISPLAY_PRICING.yearly.price,
      pricePerMonthString: '$5.99',
    };
  }

  return {
    identifier: productId,
    priceString: SUBSCRIPTION_DISPLAY_PRICING.monthly.price,
  };
}

/** Native store billing is available on iOS/Android builds (no API keys required). */
export function isNativeStoreBillingAvailable(): boolean {
  return !IS_WEB && (Platform.OS === 'ios' || Platform.OS === 'android');
}

/** @deprecated Use isStoreBillingReady — kept for call-site compatibility. */
export function isRevenueCatConfigured(): boolean {
  return isNativeStoreBillingAvailable();
}

async function loadIapModule(): Promise<ExpoIapModule | null> {
  if (iapLoadAttempted) {
    return iapModule;
  }

  iapLoadAttempted = true;

  if (!isNativeStoreBillingAvailable()) {
    return null;
  }

  try {
    iapModule = await import('expo-iap');
    return iapModule;
  } catch (error) {
    console.warn('[Subscription] expo-iap unavailable:', error);
    return null;
  }
}

async function ensureConnection(): Promise<ExpoIapModule | null> {
  const IAP = await loadIapModule();
  if (!IAP) {
    return null;
  }

  if (!connectionPromise) {
    connectionPromise = IAP.initConnection()
      .then(() => true)
      .catch((error) => {
        console.warn('[Subscription] initConnection failed:', error);
        connectionPromise = null;
        return false;
      });
  }

  const ok = await connectionPromise;
  return ok ? IAP : null;
}

function msToIso(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) {
    return null;
  }
  return new Date(ms).toISOString();
}

function mapActiveSubscription(sub: ActiveSubscription): SubscriptionStatus {
  const willRenew =
    sub.renewalInfoIOS?.willAutoRenew ??
    sub.autoRenewingAndroid ??
    true;

  const productId = PRODUCT_IDS.includes(sub.productId as SubscriptionProductId)
    ? (sub.productId as SubscriptionProductId)
    : null;

  return {
    isPro: Boolean(sub.isActive),
    expirationDate: msToIso(sub.expirationDateIOS ?? sub.renewalInfoIOS?.renewalDate ?? null),
    willRenew: Boolean(willRenew),
    productIdentifier: productId,
    isSandbox: sub.environmentIOS === 'Sandbox' || __DEV__,
  };
}

function pickBestActiveSubscription(subs: ActiveSubscription[]): ActiveSubscription | null {
  const matching = subs.filter(
    (sub) => sub.isActive && PRODUCT_IDS.includes(sub.productId as SubscriptionProductId),
  );
  if (matching.length === 0) {
    return null;
  }
  matching.sort((a, b) => (b.expirationDateIOS ?? 0) - (a.expirationDateIOS ?? 0));
  return matching[0] ?? null;
}

function mapStoreProduct(product: ProductSubscription | undefined, productId: SubscriptionProductId): SubscriptionPackage {
  if (!product) {
    return fallbackPackage(productId);
  }

  return {
    identifier: productId,
    priceString: product.displayPrice || fallbackPackage(productId).priceString,
    introPriceString:
      'introductoryPriceIOS' in product && product.introductoryPriceIOS
        ? product.introductoryPriceIOS
        : undefined,
  };
}

function readOfferToken(offer: unknown): string | null {
  if (!offer || typeof offer !== 'object') {
    return null;
  }
  const record = offer as Record<string, unknown>;
  const candidates = [
    record.offerTokenAndroid,
    record.offerToken,
    record.offer_token,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return null;
}

/** Google Play Billing 5+ requires an offer token for every subscription purchase. */
function getAndroidOfferToken(product: ProductSubscription | undefined): string | null {
  if (!product || product.platform !== 'android') {
    return null;
  }

  const offers = [
    ...(product.subscriptionOffers ?? []),
    ...(((product as { subscriptionOfferDetailsAndroid?: unknown[] }).subscriptionOfferDetailsAndroid ??
      []) as unknown[]),
  ];

  const withToken = offers.find((offer) => Boolean(readOfferToken(offer)));
  return withToken ? readOfferToken(withToken) : null;
}

function waitForPurchase(IAP: ExpoIapModule, timeoutMs = 120_000): Promise<Purchase> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Purchase timed out. Try again.'));
    }, timeoutMs);

    const successSub = IAP.purchaseUpdatedListener((purchase) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(purchase);
    });

    const errorSub = IAP.purchaseErrorListener((error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      const code = String(error?.code ?? '');
      const message = String(error?.message ?? 'Purchase failed.');
      if (code.toLowerCase().includes('cancel') || message.toLowerCase().includes('cancel')) {
        reject(new Error('Purchase cancelled.'));
        return;
      }
      reject(new Error(message));
    });

    function cleanup() {
      clearTimeout(timer);
      successSub.remove();
      errorSub.remove();
    }
  });
}

export async function configureSubscriptionService(_userId?: string | null): Promise<void> {
  await ensureConnection();
}

export async function syncSubscriptionUser(_userId: string | null): Promise<void> {
  // Direct store billing has no app-user login layer — no-op.
}

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (IS_WEB) {
    return fetchWebSubscriptionStatus();
  }

  const IAP = await ensureConnection();
  if (!IAP) {
    return emptyStatus();
  }

  try {
    const active = await IAP.getActiveSubscriptions([...PRODUCT_IDS]);
    const best = pickBestActiveSubscription(active);
    if (!best) {
      return emptyStatus();
    }
    return mapActiveSubscription(best);
  } catch (error) {
    console.warn('[Subscription] getActiveSubscriptions failed:', error);
    return emptyStatus();
  }
}

export async function fetchSubscriptionOfferings(): Promise<SubscriptionOfferings> {
  const IAP = await ensureConnection();

  if (!IAP) {
    return {
      monthly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.monthly),
      yearly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.yearly),
    };
  }

  try {
    const products = (await IAP.fetchProducts({
      skus: [...PRODUCT_IDS],
      type: 'subs',
    })) as ProductSubscription[] | null;

    const list = products ?? [];
    const monthly = list.find((p) => p.id === SUBSCRIPTION_PRODUCT_IDS.monthly);
    const yearly = list.find((p) => p.id === SUBSCRIPTION_PRODUCT_IDS.yearly);

    return {
      monthly: mapStoreProduct(monthly, SUBSCRIPTION_PRODUCT_IDS.monthly),
      yearly: mapStoreProduct(yearly, SUBSCRIPTION_PRODUCT_IDS.yearly),
    };
  } catch (error) {
    console.warn('[Subscription] fetchProducts failed:', error);
    return {
      monthly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.monthly),
      yearly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.yearly),
    };
  }
}

export async function purchaseSubscriptionProduct(
  productId: SubscriptionProductId,
): Promise<SubscriptionStatus> {
  if (IS_WEB) {
    throw new Error(
      'In-app billing is not available in Telegram Mini App yet. Subscribe on iOS or Android, then tap Sync subscription.',
    );
  }

  const IAP = await ensureConnection();
  if (!IAP) {
    throw new Error('Store billing is unavailable on this device.');
  }

  const products = (await IAP.fetchProducts({
    skus: [...PRODUCT_IDS],
    type: 'subs',
  })) as ProductSubscription[] | null;
  const product = (products ?? []).find((p) => p.id === productId);
  if (!product) {
    throw new Error('Selected plan is unavailable in the store. Create the subscription in App Store Connect / Google Play first.');
  }

  const purchasePromise = waitForPurchase(IAP);

  if (Platform.OS === 'android') {
    const googleOfferToken = getAndroidOfferToken(product);
    if (!googleOfferToken) {
      throw new Error(
        'Google Play did not return an offer token. Activate the base plan for this subscription and wait a few hours, then reinstall from the testing track.',
      );
    }

    await IAP.requestPurchase({
      type: 'subs',
      request: {
        google: {
          skus: [productId],
          subscriptionOffers: [{ sku: productId, offerToken: googleOfferToken }],
        },
      },
    });
  } else {
    await IAP.requestPurchase({
      type: 'subs',
      request: {
        apple: { sku: productId },
      },
    });
  }

  const purchase = await purchasePromise;
  await IAP.finishTransaction({ purchase, isConsumable: false });

  const status = await fetchSubscriptionStatus();
  if (!status.isPro) {
    // Purchase just finished — treat matching product as Pro even if active query lags.
    return {
      isPro: true,
      expirationDate: null,
      willRenew: true,
      productIdentifier: productId,
      isSandbox: __DEV__,
    };
  }

  void syncProStatusToServer({
    isPro: true,
    expiresAt: status.expirationDate,
  });

  return status;
}

export async function restoreSubscriptionPurchases(): Promise<SubscriptionStatus> {
  if (IS_WEB) {
    return fetchWebSubscriptionStatus();
  }

  const IAP = await ensureConnection();
  if (!IAP) {
    throw new Error('Store billing is unavailable on this device.');
  }

  await IAP.restorePurchases();
  const purchases = await IAP.getAvailablePurchases();
  for (const purchase of purchases) {
    try {
      await IAP.finishTransaction({ purchase, isConsumable: false });
    } catch {
      // Already finished / not required.
    }
  }

  const status = await fetchSubscriptionStatus();
  void syncProStatusToServer({
    isPro: status.isPro,
    expiresAt: status.expirationDate,
  });
  return status;
}

/** Opens Apple / Google subscription management (cancel / auto-renew). */
export async function openStoreManageSubscriptions(productId?: string | null): Promise<void> {
  try {
    const IAP = await ensureConnection();
    if (IAP) {
      await IAP.deepLinkToSubscriptions({
        skuAndroid: productId ?? SUBSCRIPTION_PRODUCT_IDS.monthly,
        packageNameAndroid: NATIVE_STORE_PACKAGE_ID,
      });
      return;
    }
  } catch (error) {
    console.warn('[Subscription] deepLinkToSubscriptions failed:', error);
  }

  const { openNativeManageSubscriptions } = await import('../../constants/legal');
  await openNativeManageSubscriptions(productId);
}

/** Web/TMA: resolve Pro from server profile (synced after native purchase). */
export async function fetchWebSubscriptionStatus(): Promise<SubscriptionStatus> {
  const synced = await syncProStatusToServer();
  if (!synced?.isPro) {
    return emptyStatus();
  }

  return {
    isPro: true,
    expirationDate: synced.expiresAt ?? null,
    willRenew: false,
    productIdentifier: null,
    isSandbox: false,
  };
}
