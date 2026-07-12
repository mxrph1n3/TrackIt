export type TmaAccessStatus = {
  /** Trial window active (full access). */
  isInTrial: boolean;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  /** Paid via Telegram Stars (profiles.is_pro). */
  hasStarsSubscription: boolean;
  proExpiresAt: string | null;
  /** Trial OR Stars/RevenueCat Pro — unlocks premium features. */
  hasFullAccess: boolean;
  /** Trial OR paid — unlocks smart reminders / bot notifications. */
  canUseNotifications: boolean;
  telegramUserId: number | null;
  telegramRemindersEnabled: boolean;
};

export const EMPTY_TMA_ACCESS: TmaAccessStatus = {
  isInTrial: false,
  trialStartedAt: null,
  trialEndsAt: null,
  trialDaysRemaining: 0,
  hasStarsSubscription: false,
  proExpiresAt: null,
  hasFullAccess: false,
  canUseNotifications: false,
  telegramUserId: null,
  telegramRemindersEnabled: false,
};
