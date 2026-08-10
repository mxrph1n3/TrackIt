/** Store product identifiers (same IDs in App Store Connect and Google Play Console). */
export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: 'trackit_pro_monthly',
  yearly: 'trackit_pro_yearly',
} as const;

/** Display pricing (fallback when store offerings are unavailable). */
export const SUBSCRIPTION_DISPLAY_PRICING = {
  monthly: {
    price: '$5.00',
    period: 'month',
    label: 'Monthly',
  },
  yearly: {
    price: '$50.00',
    period: 'year',
    label: 'Yearly',
    savingsLabel: 'Save 17%',
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
