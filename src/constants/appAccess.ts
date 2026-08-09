import { Platform } from 'react-native';

/**
 * Native store billing (RevenueCat + paywalls + soft trial).
 * Web/TMA uses Stars / separate flow — not this flag.
 */
export const IOS_BILLING_ENABLED = true;
export const ANDROID_BILLING_ENABLED = true;

/** @deprecated Always false when native billing is on — use isAppFullyFree(). */
export const APP_IS_FULLY_FREE_ON_IOS = !IOS_BILLING_ENABLED;

/** @deprecated Use isAppFullyFree(). */
export const APP_IS_FULLY_FREE = APP_IS_FULLY_FREE_ON_IOS;

export function isBillingEnabled(): boolean {
  if (Platform.OS === 'android') {
    return ANDROID_BILLING_ENABLED;
  }
  if (Platform.OS === 'ios') {
    return IOS_BILLING_ENABLED;
  }
  return false;
}

export function isAppFullyFree(): boolean {
  return !isBillingEnabled();
}
