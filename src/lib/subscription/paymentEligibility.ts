import { Platform } from 'react-native';

import {
  PAYMENT_REGION_BLOCKED_MESSAGE,
  isPaymentCountryBlocked,
  normalizeCountryCode,
} from '../../constants/paymentRegions';
import { IS_WEB } from '../platform/constants';

export type PaymentEligibility = {
  allowed: boolean;
  countryCode: string | null;
  reason: 'ok' | 'blocked_region' | 'unknown';
};

let cachedEligibility: PaymentEligibility | null = null;
let inflight: Promise<PaymentEligibility> | null = null;

export function getPaymentRegionBlockedMessage(): string {
  return PAYMENT_REGION_BLOCKED_MESSAGE;
}

function canQueryNativeStorefront(): boolean {
  return !IS_WEB && (Platform.OS === 'ios' || Platform.OS === 'android');
}

/**
 * Resolve App Store / Play storefront country and apply the Russia blocklist.
 * Fail-open only when storefront APIs are unavailable (console exclusion remains primary).
 */
export async function resolveNativePaymentEligibility(
  options?: { force?: boolean },
): Promise<PaymentEligibility> {
  if (!canQueryNativeStorefront()) {
    return { allowed: true, countryCode: null, reason: 'ok' };
  }

  if (!options?.force && cachedEligibility) {
    return cachedEligibility;
  }
  if (!options?.force && inflight) {
    return inflight;
  }

  inflight = (async (): Promise<PaymentEligibility> => {
    try {
      const IAP = await import('expo-iap');
      await IAP.initConnection();
      const raw = await IAP.getStorefront();
      const countryCode = normalizeCountryCode(raw) || null;
      if (isPaymentCountryBlocked(countryCode)) {
        const blocked: PaymentEligibility = {
          allowed: false,
          countryCode,
          reason: 'blocked_region',
        };
        cachedEligibility = blocked;
        return blocked;
      }
      const ok: PaymentEligibility = {
        allowed: true,
        countryCode,
        reason: 'ok',
      };
      cachedEligibility = ok;
      return ok;
    } catch (error) {
      console.warn('[PaymentEligibility] getStorefront failed:', error);
      const unknown: PaymentEligibility = {
        allowed: true,
        countryCode: null,
        reason: 'unknown',
      };
      cachedEligibility = unknown;
      return unknown;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function assertNativePaymentsAllowed(): Promise<void> {
  if (!canQueryNativeStorefront()) {
    return;
  }
  const eligibility = await resolveNativePaymentEligibility({ force: true });
  if (!eligibility.allowed) {
    throw new Error(PAYMENT_REGION_BLOCKED_MESSAGE);
  }
}
