import { TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS } from './tmaAccess.ts';

export type StarsInvoicePayload = {
  user_id: string;
  kind: 'pro_monthly';
  type: 'premium_1m';
};

export function buildStarsInvoicePayload(userId: string): string {
  const payload: StarsInvoicePayload = {
    user_id: userId,
    kind: 'pro_monthly',
    type: 'premium_1m',
  };
  return JSON.stringify(payload);
}

/** Telegram Stars invoice fields (Bot API sendInvoice / createInvoiceLink).
 *  @see https://core.telegram.org/bots/payments-stars
 *  Digital goods: currency XTR only. provider_token is omitted (physical goods only). */
export function buildStarsInvoiceBody(payload: string, starsPrice: number) {
  return {
    title: 'TrackIt Pro',
    description: 'Unlock all charts, AI Coach, and smart streaks for 1 month.',
    payload,
    currency: 'XTR',
    subscription_period: TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS,
    prices: [{ label: '1 Month Premium', amount: starsPrice }],
  };
}

export const WELCOME_MESSAGE =
  'Welcome to TrackIt! 🎯 Your ultimate habit tracker right inside Telegram. Click the button below to start tracking your progress.';

export const PAYMENT_SUCCESS_MESSAGE =
  'Thank you! Your Premium subscription has been activated. 🌟';
