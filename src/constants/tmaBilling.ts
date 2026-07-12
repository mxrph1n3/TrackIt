/** Full access trial length for new Telegram Mini App users. */
export const TMA_TRIAL_DAYS = 3;

/** Telegram Stars subscription billing period (30 days — monthly renewal). */
export const TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS = 30 * 24 * 60 * 60;

/** Display label for Stars billing cadence. */
export const TMA_STARS_BILLING_PERIOD_LABEL = 'month';

/** @deprecated Use TMA_STARS_BILLING_PERIOD_LABEL — kept for backwards compatibility */
export const TMA_STARS_PRO_DAYS = 30;

/** Default Stars price per month (override via EXPO_PUBLIC_TMA_STARS_PRICE). */
export const TMA_STARS_DEFAULT_PRICE = 250;

export function getTmaStarsPrice(): number {
  const raw = process.env.EXPO_PUBLIC_TMA_STARS_PRICE;
  const parsed = raw ? Number.parseInt(raw, 10) : TMA_STARS_DEFAULT_PRICE;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : TMA_STARS_DEFAULT_PRICE;
}
