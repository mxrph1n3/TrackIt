/** RevenueCat / store product identifiers (same on iOS and Android). */
export const SUBSCRIPTION_PRODUCT_IDS = {
  monthly: 'trackit_pro_monthly',
  yearly: 'trackit_pro_yearly',
} as const;

/** RevenueCat entitlement identifier — grant Pro access when active. */
export const REVENUECAT_ENTITLEMENT_ID = 'pro';

/** Display pricing (fallback when store offerings are unavailable). */
export const SUBSCRIPTION_DISPLAY_PRICING = {
  monthly: {
    price: '$5.99',
    period: 'month',
    label: 'Monthly',
  },
  yearly: {
    price: '$59.99',
    period: 'year',
    label: 'Yearly',
    savingsLabel: 'Save 37%',
  },
} as const;

export const PREMIUM_BENEFITS = [
  'AI Coach',
  '100+ workout programs',
  'Unlimited custom programs',
  'Full exercise library',
  'Smart nutrition planning',
  'Finance insights & forecasts',
  'Advanced analytics',
  'Cloud sync',
  'Automatic backups',
  'PDF / Excel export',
  'Premium themes',
] as const;

export const FREE_TRIAL_DAYS = 7;
