import { Platform } from 'react-native';

import {
  REVENUECAT_ENTITLEMENT_ID,
  SUBSCRIPTION_DISPLAY_PRICING,
  SUBSCRIPTION_PRODUCT_IDS,
} from '../../constants/subscriptions';
import type {
  SubscriptionOfferings,
  SubscriptionPackage,
  SubscriptionProductId,
  SubscriptionStatus,
} from '../../types/subscription';

type PurchasesModule = typeof import('react-native-purchases');

let purchasesModule: PurchasesModule | null = null;
let purchasesLoadAttempted = false;

function getRevenueCatApiKey(): string | null {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ?? null;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY ?? null;
  }
  return null;
}

export function isRevenueCatConfigured(): boolean {
  return Boolean(getRevenueCatApiKey());
}

async function loadPurchasesModule(): Promise<PurchasesModule | null> {
  if (purchasesLoadAttempted) {
    return purchasesModule;
  }

  purchasesLoadAttempted = true;

  if (!isRevenueCatConfigured()) {
    return null;
  }

  try {
    purchasesModule = await import('react-native-purchases');
    return purchasesModule;
  } catch (error) {
    console.warn('[Subscription] react-native-purchases unavailable:', error);
    return null;
  }
}

function fallbackPackage(productId: SubscriptionProductId): SubscriptionPackage {
  if (productId === SUBSCRIPTION_PRODUCT_IDS.yearly) {
    return {
      identifier: productId,
      priceString: SUBSCRIPTION_DISPLAY_PRICING.yearly.price,
      pricePerMonthString: '$5.00',
    };
  }

  return {
    identifier: productId,
    priceString: SUBSCRIPTION_DISPLAY_PRICING.monthly.price,
  };
}

function mapPackage(
  productId: SubscriptionProductId,
  storePackage: { product: { priceString: string; introPrice?: { priceString: string } | null } } | undefined,
): SubscriptionPackage | null {
  if (!storePackage) {
    return fallbackPackage(productId);
  }

  return {
    identifier: productId,
    priceString: storePackage.product.priceString,
    introPriceString: storePackage.product.introPrice?.priceString ?? undefined,
  };
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

export async function configureSubscriptionService(userId?: string | null): Promise<void> {
  const Purchases = await loadPurchasesModule();
  const apiKey = getRevenueCatApiKey();

  if (!Purchases || !apiKey) {
    return;
  }

  Purchases.default.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.WARN);
  Purchases.default.configure({ apiKey, appUserID: userId ?? undefined });
}

export async function syncSubscriptionUser(userId: string | null): Promise<void> {
  const Purchases = await loadPurchasesModule();
  if (!Purchases || !isRevenueCatConfigured()) {
    return;
  }

  if (userId) {
    await Purchases.default.logIn(userId);
    return;
  }

  await Purchases.default.logOut();
}

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const Purchases = await loadPurchasesModule();
  if (!Purchases || !isRevenueCatConfigured()) {
    return emptyStatus();
  }

  const customerInfo = await Purchases.default.getCustomerInfo();
  const entitlement = customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];

  if (!entitlement) {
    return emptyStatus();
  }

  const productId = entitlement.productIdentifier as SubscriptionProductId;

  return {
    isPro: true,
    expirationDate: entitlement.expirationDate,
    willRenew: entitlement.willRenew,
    productIdentifier: productId,
    isSandbox: customerInfo.requestDate ? __DEV__ : false,
  };
}

export async function fetchSubscriptionOfferings(): Promise<SubscriptionOfferings> {
  const Purchases = await loadPurchasesModule();

  if (!Purchases || !isRevenueCatConfigured()) {
    return {
      monthly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.monthly),
      yearly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.yearly),
    };
  }

  const offerings = await Purchases.default.getOfferings();
  const current = offerings.current;

  if (!current) {
    return {
      monthly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.monthly),
      yearly: fallbackPackage(SUBSCRIPTION_PRODUCT_IDS.yearly),
    };
  }

  const monthly =
    current.availablePackages.find(
      (pkg) => pkg.product.identifier === SUBSCRIPTION_PRODUCT_IDS.monthly,
    ) ??
    current.monthly ??
    current.availablePackages.find((pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.MONTHLY);

  const yearly =
    current.availablePackages.find(
      (pkg) => pkg.product.identifier === SUBSCRIPTION_PRODUCT_IDS.yearly,
    ) ??
    current.annual ??
    current.availablePackages.find((pkg) => pkg.packageType === Purchases.PACKAGE_TYPE.ANNUAL);

  return {
    monthly: mapPackage(SUBSCRIPTION_PRODUCT_IDS.monthly, monthly),
    yearly: mapPackage(SUBSCRIPTION_PRODUCT_IDS.yearly, yearly),
  };
}

export async function purchaseSubscriptionProduct(
  productId: SubscriptionProductId,
): Promise<SubscriptionStatus> {
  const Purchases = await loadPurchasesModule();

  if (!Purchases || !isRevenueCatConfigured()) {
    throw new Error('Subscriptions are not configured yet. Add RevenueCat API keys.');
  }

  const offerings = await Purchases.default.getOfferings();
  const current = offerings.current;

  if (!current) {
    throw new Error('No subscription offerings available.');
  }

  const target =
    current.availablePackages.find((pkg) => pkg.product.identifier === productId) ??
    (productId === SUBSCRIPTION_PRODUCT_IDS.monthly ? current.monthly : current.annual);

  if (!target) {
    throw new Error('Selected plan is unavailable in the store.');
  }

  const { customerInfo } = await Purchases.default.purchasePackage(target);
  const entitlement = customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];

  if (!entitlement) {
    throw new Error('Purchase completed but Pro access was not granted.');
  }

  return {
    isPro: true,
    expirationDate: entitlement.expirationDate,
    willRenew: entitlement.willRenew,
    productIdentifier: entitlement.productIdentifier as SubscriptionProductId,
    isSandbox: __DEV__,
  };
}

export async function restoreSubscriptionPurchases(): Promise<SubscriptionStatus> {
  const Purchases = await loadPurchasesModule();

  if (!Purchases || !isRevenueCatConfigured()) {
    throw new Error('Subscriptions are not configured yet. Add RevenueCat API keys.');
  }

  await Purchases.default.restorePurchases();
  return fetchSubscriptionStatus();
}
