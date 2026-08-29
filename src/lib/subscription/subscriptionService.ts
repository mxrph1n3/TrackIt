import { Platform } from 'react-native';

import {
  ANDROID_SUBSCRIPTION_PRODUCT_IDS,
  IOS_SUBSCRIPTION_PRODUCT_IDS,
  SUBSCRIPTION_DISPLAY_PRICING,
  getStoreProductIds,
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

const ANDROID_QUERY_SKUS = [
  ANDROID_SUBSCRIPTION_PRODUCT_IDS.monthly,
  ANDROID_SUBSCRIPTION_PRODUCT_IDS.yearly,
] as const;

function currentProductIds() {
  return getStoreProductIds();
}

function skuCandidates(productId: string): string[] {
  const yearly = productId.toLowerCase().includes('yearly');
  if (Platform.OS === 'android') {
    return [
      yearly
        ? ANDROID_SUBSCRIPTION_PRODUCT_IDS.yearly
        : ANDROID_SUBSCRIPTION_PRODUCT_IDS.monthly,
    ];
  }
  if (Platform.OS === 'ios') {
    return [
      yearly ? IOS_SUBSCRIPTION_PRODUCT_IDS.yearly : IOS_SUBSCRIPTION_PRODUCT_IDS.monthly,
    ];
  }
  return yearly
    ? [ANDROID_SUBSCRIPTION_PRODUCT_IDS.yearly, IOS_SUBSCRIPTION_PRODUCT_IDS.yearly]
    : [ANDROID_SUBSCRIPTION_PRODUCT_IDS.monthly, IOS_SUBSCRIPTION_PRODUCT_IDS.monthly];
}

function expectedAndroidSku(productId: string): string {
  return productId.toLowerCase().includes('yearly')
    ? ANDROID_SUBSCRIPTION_PRODUCT_IDS.yearly
    : ANDROID_SUBSCRIPTION_PRODUCT_IDS.monthly;
}

type ExpoIapModule = typeof import('expo-iap');
type ProductSubscription = import('expo-iap').ProductSubscription;
type Purchase = import('expo-iap').Purchase;
type ActiveSubscription = import('expo-iap').ActiveSubscription;

let iapModule: ExpoIapModule | null = null;
let iapLoadAttempted = false;
let connectionPromise: Promise<boolean> | null = null;
/** Prevent overlapping launchBillingFlow calls — Play returns DEVELOPER_ERROR. */
let purchaseInFlight: Promise<SubscriptionStatus> | null = null;
let lastPurchaseAttemptAt = 0;
/** Serialize Android BillingClient reconnects (endConnection + initConnection). */
let reconnectLock: Promise<ExpoIapModule | null> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? '');
}

function allKnownSkus(): string[] {
  if (Platform.OS === 'android') {
    return [...ANDROID_QUERY_SKUS];
  }
  const ids = currentProductIds();
  return [ids.monthly, ids.yearly];
}

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
  if (String(productId).includes('yearly')) {
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

function isPlayBillingDisconnected(error: unknown): boolean {
  return /not connected|service disconnected|billing.?unavailable|play store service/i.test(
    errorText(error),
  );
}

/** Card / Google Payments decline — not a BillingClient bug. */
function isPaymentDeclinedError(error: unknown): boolean {
  return /or-fgemf|payment.?declined|transaction was declined|unsuccessful|another payment method|choose another payment|billing.?response.?code.?7|item.?not.?owned/i.test(
    errorText(error),
  );
}

/**
 * Stale Play Billing session after cancel / failed sheet / process death.
 * Safe to endConnection + initConnection and retry once.
 */
function isBillingSessionError(error: unknown): boolean {
  if (isPaymentDeclinedError(error)) {
    return false;
  }
  return (
    isPlayBillingDisconnected(error) ||
    /invalid arguments provided to the api|developer\.?error|developer_error|service.?timeout|dead.?client|billing.?client/i.test(
      errorText(error),
    )
  );
}

function playBillingNotConnectedError(): Error {
  return new Error(
    'Google Play Billing is not connected. Open the Play Store, sign in, install TrackIt from Google Play, then try again.',
  );
}

function paymentDeclinedError(): Error {
  return new Error(
    'Google Play declined this payment method (card / account / country mismatch). Change the payment method in Play Store — this is not an app bug.',
  );
}

async function ensureConnection(): Promise<ExpoIapModule | null> {
  const IAP = await loadIapModule();
  if (!IAP) {
    return null;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        const result = await IAP.initConnection();
        if (result === false) {
          connectionPromise = null;
          return false;
        }
        return true;
      } catch (error) {
        console.warn('[Subscription] initConnection failed:', error);
        connectionPromise = null;
        return false;
      }
    })();
  }

  const ok = await connectionPromise;
  return ok ? IAP : null;
}

/** True while launchBillingFlow / purchase listeners are active. */
export function isStorePurchaseInFlight(): boolean {
  return purchaseInFlight != null;
}

/**
 * Tear down and re-open BillingClient. Call after session errors or when
 * returning to foreground — avoids forcing the user to kill the app.
 */
export async function resetStoreBillingConnection(options?: {
  /** Bypass in-flight purchase guard (used by purchase retry). */
  force?: boolean;
}): Promise<boolean> {
  if (!isNativeStoreBillingAvailable()) {
    return false;
  }
  if (purchaseInFlight && !options?.force) {
    return true;
  }
  if (reconnectLock) {
    return Boolean(await reconnectLock);
  }

  reconnectLock = (async () => {
    const IAP = await loadIapModule();
    if (!IAP) {
      return null;
    }
    connectionPromise = null;
    try {
      await IAP.endConnection();
    } catch (error) {
      console.warn('[Subscription] endConnection:', error);
    }
    await sleep(450);
    return ensureConnection();
  })();

  try {
    const client = await reconnectLock;
    return Boolean(client);
  } finally {
    reconnectLock = null;
  }
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

  const productId = allKnownSkus().includes(sub.productId)
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
    (sub) => sub.isActive && allKnownSkus().includes(sub.productId),
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

/** Real Play Billing offer tokens are long opaque strings — never base-plan ids. */
const MIN_PLAY_OFFER_TOKEN_LENGTH = 16;

function readOfferToken(offer: unknown): string | null {
  if (!offer || typeof offer !== 'object') {
    return null;
  }
  const record = offer as Record<string, unknown>;
  const candidates = [
    record.offerTokenAndroid,
    record.offerToken,
    record.offerIdToken,
  ];
  for (const value of candidates) {
    if (
      typeof value === 'string' &&
      value.length >= MIN_PLAY_OFFER_TOKEN_LENGTH &&
      !/\s/.test(value)
    ) {
      return value;
    }
  }
  return null;
}

/** Prefer the default base-plan offer (empty offer id) over promos/win-backs. */
function isLikelyBasePlanOffer(offer: unknown): boolean {
  if (!offer || typeof offer !== 'object') {
    return false;
  }
  const record = offer as Record<string, unknown>;
  const offerId = String(record.id ?? record.offerIdAndroid ?? record.offerId ?? '').trim();
  return offerId.length === 0;
}

function listAndroidOffers(product: ProductSubscription): unknown[] {
  const record = product as ProductSubscription & Record<string, unknown>;
  const primary = Array.isArray(record.subscriptionOffers) ? record.subscriptionOffers : [];
  if (primary.some((offer) => Boolean(readOfferToken(offer)))) {
    return primary;
  }
  return [
    ...primary,
    ...(Array.isArray(record.subscriptionOfferDetailsAndroid)
      ? record.subscriptionOfferDetailsAndroid
      : []),
    ...(Array.isArray(record.subscriptionOfferDetails) ? record.subscriptionOfferDetails : []),
  ];
}

/** Google Play Billing 5+ requires an offer token for every subscription purchase. */
function getAndroidOfferToken(product: ProductSubscription | undefined): string | null {
  if (!product) {
    return null;
  }

  const offers = listAndroidOffers(product);
  const withToken = offers.filter((offer) => Boolean(readOfferToken(offer)));
  if (withToken.length === 0) {
    return null;
  }

  // Product is already the monthly or yearly SKU — prefer base-plan offer, else first token.
  const baseOffer = withToken.find(isLikelyBasePlanOffer);
  const chosen = baseOffer ?? withToken[0];
  return chosen ? readOfferToken(chosen) : null;
}

function coercePurchase(result: unknown): Purchase | null {
  if (!result) {
    return null;
  }
  if (Array.isArray(result)) {
    for (const item of result) {
      const purchase = coercePurchase(item);
      if (purchase) {
        return purchase;
      }
    }
    return null;
  }
  if (typeof result !== 'object') {
    return null;
  }
  const record = result as Record<string, unknown>;
  const productId = String(record.productId ?? record.id ?? '').trim();
  if (!productId) {
    return null;
  }
  return result as Purchase;
}

function androidProductUnavailableReason(product: ProductSubscription | undefined): string | null {
  if (!product) {
    return null;
  }
  const status = String(
    (product as ProductSubscription & { productStatusAndroid?: string }).productStatusAndroid ?? '',
  ).toLowerCase();
  if (status.includes('not-found')) {
    return 'Play does not know this product ID. Use trackit_pro_monthly / trackit_pro_yearly on Google Play.';
  }
  if (status.includes('no-offers')) {
    return 'The base plan has no active offers. In Play Console open the subscription → base plan → Activate.';
  }
  return null;
}

function findStoreProduct(
  products: ProductSubscription[],
  productId: SubscriptionProductId,
): ProductSubscription | undefined {
  return products.find((product) => {
    const record = product as ProductSubscription & { productId?: string };
    return record.id === productId || record.productId === productId;
  });
}

function findPlanProduct(
  products: ProductSubscription[],
  productId: string,
): ProductSubscription | undefined {
  for (const sku of skuCandidates(productId)) {
    const found = findStoreProduct(products, sku as SubscriptionProductId);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function createPurchaseWait(IAP: ExpoIapModule, timeoutMs = 120_000) {
  let settled = false;
  let successSub: { remove: () => void } | null = null;
  let errorSub: { remove: () => void } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function cleanup() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    successSub?.remove();
    errorSub?.remove();
    successSub = null;
    errorSub = null;
  }

  const promise = new Promise<Purchase>((resolve, reject) => {
    timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new Error('Purchase timed out. Try again.'));
    }, timeoutMs);

    successSub = IAP.purchaseUpdatedListener((purchase) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(purchase);
    });

    errorSub = IAP.purchaseErrorListener((error) => {
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
  });

  return {
    promise,
    cancel() {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
    },
  };
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
    const active = await IAP.getActiveSubscriptions(allKnownSkus());
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

async function fetchStoreProducts(IAP: ExpoIapModule): Promise<ProductSubscription[]> {
  const list = await IAP.fetchProducts({
    skus: allKnownSkus(),
    type: 'subs',
  });
  return (list as ProductSubscription[] | null | undefined) ?? [];
}

function androidPurchaseSku(product: ProductSubscription, productId: string): string {
  const expected = expectedAndroidSku(productId);
  const record = product as ProductSubscription & { productId?: string };
  const fromStore = String(record.id || record.productId || '').trim();
  // Always purchase the canonical Play product id — never an iOS `_v2` sku.
  if (fromStore === expected) {
    return expected;
  }
  if (
    fromStore === ANDROID_SUBSCRIPTION_PRODUCT_IDS.monthly ||
    fromStore === ANDROID_SUBSCRIPTION_PRODUCT_IDS.yearly
  ) {
    return fromStore;
  }
  return expected;
}

function isRetryableAndroidPurchaseError(error: unknown): boolean {
  if (isPaymentDeclinedError(error) || isUserCancelledPurchase(error)) {
    return false;
  }
  return (
    isBillingSessionError(error) ||
    /invalid arguments provided to the api|offer.?token|item.?unavailable|billing.?response.?code.?4/i.test(
      errorText(error),
    )
  );
}

function isUserCancelledPurchase(error: unknown): boolean {
  return /cancel/i.test(errorText(error));
}

function mapPurchaseFailure(error: unknown): Error {
  if (isUserCancelledPurchase(error)) {
    return error instanceof Error ? error : new Error('Purchase cancelled.');
  }
  if (isPaymentDeclinedError(error)) {
    return paymentDeclinedError();
  }
  if (isPlayBillingDisconnected(error)) {
    return playBillingNotConnectedError();
  }
  if (/invalid arguments provided to the api/i.test(errorText(error))) {
    return new Error(
      'Google Play rejected the purchase request. Close TrackIt completely, reopen from Play Store, then try Subscribe once.',
    );
  }
  return error instanceof Error ? error : new Error(errorText(error) || 'Purchase failed.');
}

export async function fetchSubscriptionOfferings(): Promise<SubscriptionOfferings> {
  const ids = currentProductIds();
  const IAP = await ensureConnection();

  if (!IAP) {
    return {
      monthly: fallbackPackage(ids.monthly),
      yearly: fallbackPackage(ids.yearly),
    };
  }

  try {
    const list = await fetchStoreProducts(IAP);
    const monthly = findPlanProduct(list, ids.monthly);
    const yearly = findPlanProduct(list, ids.yearly);

    return {
      monthly: mapStoreProduct(monthly, ids.monthly),
      yearly: mapStoreProduct(yearly, ids.yearly),
    };
  } catch (error) {
    console.warn('[Subscription] fetchProducts failed:', error);
    return {
      monthly: fallbackPackage(ids.monthly),
      yearly: fallbackPackage(ids.yearly),
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

  if (purchaseInFlight) {
    throw new Error('A purchase is already in progress. Wait a moment and try again.');
  }

  const elapsed = Date.now() - lastPurchaseAttemptAt;
  // Give Play Billing time to settle after a previous sheet (cancel / decline).
  if (Platform.OS === 'android' && elapsed > 0 && elapsed < 2200) {
    await sleep(2200 - elapsed);
  }

  const attempt = (async (): Promise<SubscriptionStatus> => {
    lastPurchaseAttemptAt = Date.now();

    // Wait out any in-flight reconnect so we don't launchBillingFlow on a dying client.
    if (reconnectLock) {
      await reconnectLock;
    }

    let client = await ensureConnection();
    if (!client) {
      if (Platform.OS === 'android') {
        const recovered = await resetStoreBillingConnection({ force: true });
        client = recovered ? await ensureConnection() : null;
      }
      if (!client) {
        throw playBillingNotConnectedError();
      }
    }

    const run = async (iap: ExpoIapModule): Promise<Purchase> => {
      const products = await fetchStoreProducts(iap);
      const product = findPlanProduct(products, productId);
      if (!product) {
        throw new Error(
          Platform.OS === 'android'
            ? 'Selected plan is unavailable in the store. On Google Play activate trackit_pro_monthly and trackit_pro_yearly (Active base plans).'
            : 'Selected plan is unavailable in the App Store. Activate trackit_pro_monthly_v2 / trackit_pro_yearly_v2.',
        );
      }

      const wait = createPurchaseWait(iap);
      try {
        if (Platform.OS === 'android') {
          const purchaseSku = androidPurchaseSku(product, productId);
          if (
            purchaseSku !== ANDROID_SUBSCRIPTION_PRODUCT_IDS.monthly &&
            purchaseSku !== ANDROID_SUBSCRIPTION_PRODUCT_IDS.yearly
          ) {
            throw new Error(
              `Invalid Play subscription id "${purchaseSku}". Expected trackit_pro_monthly or trackit_pro_yearly.`,
            );
          }
          const googleOfferToken = getAndroidOfferToken(product);
          if (!googleOfferToken) {
            throw new Error(
              androidProductUnavailableReason(product) ??
                'Google Play did not return a subscription offer token. Activate the base plan offers for trackit_pro_monthly / trackit_pro_yearly.',
            );
          }

          const result = await iap.requestPurchase({
            type: 'subs',
            request: {
              google: {
                skus: [purchaseSku],
                subscriptionOffers: [{ sku: purchaseSku, offerToken: googleOfferToken }],
              },
            },
          });

          const fromRequest = coercePurchase(result);
          if (fromRequest) {
            wait.cancel();
            return fromRequest;
          }
          // Some Play / OpenIAP builds deliver only via purchaseUpdatedListener.
          return await wait.promise;
        }

        const result = await iap.requestPurchase({
          type: 'subs',
          request: {
            apple: { sku: productId },
          },
        });
        const fromRequest = coercePurchase(result);
        if (fromRequest) {
          wait.cancel();
          return fromRequest;
        }
        return await wait.promise;
      } catch (error) {
        wait.cancel();
        throw error;
      }
    };

    let purchase: Purchase;
    try {
      purchase = await run(client);
    } catch (error) {
      if (isUserCancelledPurchase(error) || isPaymentDeclinedError(error)) {
        throw mapPurchaseFailure(error);
      }
      if (Platform.OS === 'android' && isRetryableAndroidPurchaseError(error)) {
        // Soft retry first (fresh ProductDetails on same client) — avoids killing a healthy session.
        await sleep(1500);
        try {
          purchase = await run(client);
        } catch (softRetryError) {
          if (isUserCancelledPurchase(softRetryError) || isPaymentDeclinedError(softRetryError)) {
            throw mapPurchaseFailure(softRetryError);
          }
          await sleep(1500);
          const reconnected = await resetStoreBillingConnection({ force: true });
          if (!reconnected) {
            throw playBillingNotConnectedError();
          }
          const fresh = await ensureConnection();
          if (!fresh) {
            throw playBillingNotConnectedError();
          }
          client = fresh;
          try {
            purchase = await run(client);
          } catch (hardRetryError) {
            throw mapPurchaseFailure(hardRetryError);
          }
        }
      } else {
        throw mapPurchaseFailure(error);
      }
    }

    await client.finishTransaction({ purchase, isConsumable: false });

    const status = await fetchSubscriptionStatus();
    if (!status.isPro) {
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
  })();

  purchaseInFlight = attempt;
  try {
    return await attempt;
  } finally {
    purchaseInFlight = null;
    lastPurchaseAttemptAt = Date.now();
  }
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
        skuAndroid: productId ?? currentProductIds().monthly,
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
