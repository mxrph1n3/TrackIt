/**
 * Soft Pro trial on iOS / Android before paywall gating (device-local).
 * Same length on both stores.
 */
export const NATIVE_SOFT_TRIAL_DAYS = 3;

/** @deprecated Use NATIVE_SOFT_TRIAL_DAYS */
export const ANDROID_TRIAL_DAYS = NATIVE_SOFT_TRIAL_DAYS;

/**
 * Store-configured intro trial days shown on the purchase CTA.
 * Set to 0 when App Store / Play has no free-trial offer
 * (local NATIVE_SOFT_TRIAL_DAYS still applies).
 */
export const FREE_TRIAL_DAYS = 0;
