/**
 * Storefront / payment country codes where TrackIt must not sell subscriptions.
 * Apple StoreKit uses ISO 3166-1 alpha-3 (e.g. RUS); Google Play often uses alpha-2 (RU).
 */
export const PAYMENT_BLOCKED_COUNTRY_CODES = ['RU', 'RUS'] as const;

export type PaymentBlockedCountryCode = (typeof PAYMENT_BLOCKED_COUNTRY_CODES)[number];

export function normalizeCountryCode(raw: string | null | undefined): string {
  return String(raw ?? '')
    .trim()
    .toUpperCase();
}

export function isPaymentCountryBlocked(raw: string | null | undefined): boolean {
  const code = normalizeCountryCode(raw);
  if (!code) {
    return false;
  }
  return (PAYMENT_BLOCKED_COUNTRY_CODES as readonly string[]).includes(code);
}

export const PAYMENT_REGION_BLOCKED_MESSAGE =
  'Subscriptions are not available in your region.';
