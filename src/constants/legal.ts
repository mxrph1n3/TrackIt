import { Linking, Platform } from 'react-native';

import { SUBSCRIPTION_PRODUCT_IDS } from './subscriptions';

const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL ?? 'https://track-it-umber-psi.vercel.app').replace(/\/$/, '');

export const PRIVACY_POLICY_URL = `${WEB_APP_URL}/privacy`;
export const TERMS_OF_SERVICE_URL = `${WEB_APP_URL}/terms`;
export const SUPPORT_URL = `${WEB_APP_URL}/support`;
export const SUPPORT_EMAIL = 'mxrphin3work@gmail.com';

/** App Store / Play Console package — keep in sync with app.json. */
export const NATIVE_STORE_PACKAGE_ID = 'com.trackit.lifeos';

export const APPLE_MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function getGoogleManageSubscriptionsUrl(productId?: string): string {
  const sku = productId ?? SUBSCRIPTION_PRODUCT_IDS.monthly;
  return `https://play.google.com/store/account/subscriptions?sku=${encodeURIComponent(sku)}&package=${encodeURIComponent(NATIVE_STORE_PACKAGE_ID)}`;
}

/** Opens the platform subscription management page (cancel / auto-renew). */
export async function openNativeManageSubscriptions(productId?: string | null): Promise<void> {
  const url =
    Platform.OS === 'android'
      ? getGoogleManageSubscriptionsUrl(productId ?? undefined)
      : APPLE_MANAGE_SUBSCRIPTIONS_URL;
  await Linking.openURL(url);
}
