import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { NATIVE_SOFT_TRIAL_DAYS } from '../../constants/androidBilling';
import { isBillingEnabled } from '../../constants/appAccess';
import {
  EMPTY_ANDROID_TRIAL,
  type AndroidTrialStatus,
} from '../../types/androidTrial';

const STORAGE_KEY = '@trackit/soft_trial_started_at';
const LEGACY_ANDROID_KEY = '@trackit/android_trial_started_at';
const EXPIRED_PROMPT_KEY = '@trackit/soft_trial_expired_prompted';
const LEGACY_EXPIRED_PROMPT_KEY = '@trackit/android_trial_expired_prompted';

function addDays(iso: string, days: number): Date {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function daysRemaining(endsAt: Date, now: Date): number {
  const ms = endsAt.getTime() - now.getTime();
  if (ms <= 0) {
    return 0;
  }
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

/** Soft trial on native store builds (iOS App Store + Google Play). */
export function canUseAndroidTrial(): boolean {
  return (Platform.OS === 'ios' || Platform.OS === 'android') && isBillingEnabled();
}

export function computeAndroidTrialStatus(
  startedAtIso: string | null,
  now: Date = new Date(),
): AndroidTrialStatus {
  if (!startedAtIso) {
    return EMPTY_ANDROID_TRIAL;
  }

  const endsAt = addDays(startedAtIso, NATIVE_SOFT_TRIAL_DAYS);
  const inTrial = now.getTime() < endsAt.getTime();

  return {
    started: true,
    isInTrial: inTrial,
    trialStartedAt: startedAtIso,
    trialEndsAt: endsAt.toISOString(),
    trialDaysRemaining: inTrial ? daysRemaining(endsAt, now) : 0,
    isExpired: !inTrial,
  };
}

async function readTrialStartedAt(): Promise<string | null> {
  const current = await AsyncStorage.getItem(STORAGE_KEY);
  if (current) {
    return current;
  }

  // Migrate older Android-only installs.
  const legacy = await AsyncStorage.getItem(LEGACY_ANDROID_KEY);
  if (legacy) {
    await AsyncStorage.setItem(STORAGE_KEY, legacy);
    return legacy;
  }

  return null;
}

/** Starts the soft trial on first launch (idempotent). */
export async function ensureAndroidTrialStarted(): Promise<AndroidTrialStatus> {
  if (!canUseAndroidTrial()) {
    return EMPTY_ANDROID_TRIAL;
  }

  try {
    const existing = await readTrialStartedAt();
    if (existing) {
      return computeAndroidTrialStatus(existing);
    }

    const startedAt = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEY, startedAt);
    return computeAndroidTrialStatus(startedAt);
  } catch (error) {
    console.warn('[SoftTrial] failed to read/write trial start:', error);
    return EMPTY_ANDROID_TRIAL;
  }
}

export async function loadAndroidTrialStatus(): Promise<AndroidTrialStatus> {
  if (!canUseAndroidTrial()) {
    return EMPTY_ANDROID_TRIAL;
  }

  try {
    const existing = await readTrialStartedAt();
    return computeAndroidTrialStatus(existing);
  } catch (error) {
    console.warn('[SoftTrial] failed to load trial status:', error);
    return EMPTY_ANDROID_TRIAL;
  }
}

/** True once per install after trial ends (until marked consumed). */
export async function shouldPromptAndroidTrialExpired(): Promise<boolean> {
  if (!canUseAndroidTrial()) {
    return false;
  }

  try {
    const status = await loadAndroidTrialStatus();
    if (!status.isExpired) {
      return false;
    }
    const prompted =
      (await AsyncStorage.getItem(EXPIRED_PROMPT_KEY)) ??
      (await AsyncStorage.getItem(LEGACY_EXPIRED_PROMPT_KEY));
    return prompted !== '1';
  } catch {
    return false;
  }
}

export async function markAndroidTrialExpiredPrompted(): Promise<void> {
  try {
    await AsyncStorage.setItem(EXPIRED_PROMPT_KEY, '1');
  } catch (error) {
    console.warn('[SoftTrial] failed to mark expired prompt:', error);
  }
}
