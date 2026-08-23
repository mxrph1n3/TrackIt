import { Platform } from 'react-native';

/** Google Play product IDs — must match Play Console exactly. */
export const ANDROID_SUBSCRIPTION_PRODUCT_IDS = {
  monthly: 'trackit_pro_monthly',
  yearly: 'trackit_pro_yearly',
} as const;

/**
 * App Store product IDs. `_v2` because the original IDs were already used
 * as non-subscription IAPs and cannot be reused.
 */
export const IOS_SUBSCRIPTION_PRODUCT_IDS = {
  monthly: 'trackit_pro_monthly_v2',
  yearly: 'trackit_pro_yearly_v2',
} as const;

/** Store product identifiers for the current platform. */
export const SUBSCRIPTION_PRODUCT_IDS =
  Platform.OS === 'android' ? ANDROID_SUBSCRIPTION_PRODUCT_IDS : IOS_SUBSCRIPTION_PRODUCT_IDS;

/** Display pricing (fallback when store offerings are unavailable). */
export const SUBSCRIPTION_DISPLAY_PRICING = {
  monthly: {
    price: '$5.99',
    period: 'month',
    label: 'Monthly',
  },
  yearly: {
    price: '$50.00',
    period: 'year',
    label: 'Yearly',
    savingsLabel: 'Save 30%',
  },
} as const;

export const PREMIUM_BENEFITS = [
  'Structured workout programs',
  'Unlimited custom programs',
  'Full exercise library',
  'Smart nutrition planning',
  'Finance insights & forecasts',
  'Advanced analytics',
  'Cloud sync across devices',
  'Premium themes',
] as const;

/** Re-export — store intro CTA days (0 = no store free-trial offer). */
export { FREE_TRIAL_DAYS, ANDROID_TRIAL_DAYS, NATIVE_SOFT_TRIAL_DAYS } from './androidBilling';
