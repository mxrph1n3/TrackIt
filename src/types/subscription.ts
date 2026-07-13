import type { SUBSCRIPTION_PRODUCT_IDS } from '../constants/subscriptions';

export type SubscriptionProductId =
  (typeof SUBSCRIPTION_PRODUCT_IDS)[keyof typeof SUBSCRIPTION_PRODUCT_IDS];

/** Premium capabilities that can be gated independently. */
export type PremiumFeatureId =
  | 'ai_coach'
  | 'ai_tasks'
  | 'ai_habits'
  | 'ai_workout'
  | 'ai_nutrition'
  | 'ai_finance'
  | 'ai_notes'
  | 'advanced_analytics'
  | 'cloud_sync'
  | 'premium_themes'
  | 'dashboard_customization'
  | 'pro_workout_programs'
  | 'custom_workout_programs'
  | 'custom_exercise_library';

export type SubscriptionPackage = {
  identifier: SubscriptionProductId;
  priceString: string;
  pricePerMonthString?: string;
  introPriceString?: string;
};

export type SubscriptionOfferings = {
  monthly: SubscriptionPackage | null;
  yearly: SubscriptionPackage | null;
};

export type SubscriptionStatus = {
  isPro: boolean;
  expirationDate: string | null;
  willRenew: boolean;
  productIdentifier: SubscriptionProductId | null;
  isSandbox: boolean;
};
