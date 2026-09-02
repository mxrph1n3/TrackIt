/**
 * Payment country blocklist (Russia). Keep in sync with src/constants/paymentRegions.ts
 */
export const PAYMENT_BLOCKED_COUNTRY_CODES = ['RU', 'RUS'] as const;

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

/** Best-effort country from CDN / edge headers (Vercel, Cloudflare). */
export function countryFromRequestHeaders(headers: Headers): string | null {
  const candidates = [
    headers.get('cf-ipcountry'),
    headers.get('x-vercel-ip-country'),
    headers.get('x-country-code'),
    headers.get('x-geo-country'),
  ];
  for (const value of candidates) {
    const code = normalizeCountryCode(value);
    if (code && code !== 'XX' && code !== 'T1') {
      return code;
    }
  }
  return null;
}

export const PAYMENT_REGION_BLOCKED_MESSAGE =
  'Subscriptions are not available in your region.';
