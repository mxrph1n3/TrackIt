export type AndroidTrialStatus = {
  /** Trial clock has started for this install/user. */
  started: boolean;
  isInTrial: boolean;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  /** Trial finished and user has not purchased Pro. */
  isExpired: boolean;
};

export const EMPTY_ANDROID_TRIAL: AndroidTrialStatus = {
  started: false,
  isInTrial: false,
  trialStartedAt: null,
  trialEndsAt: null,
  trialDaysRemaining: 0,
  isExpired: false,
};
