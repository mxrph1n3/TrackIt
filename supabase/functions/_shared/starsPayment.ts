/**
 * Telegram Stars (XTR) payment flow per official docs:
 * https://core.telegram.org/bots/payments-stars
 *
 * 1. sendInvoice / createInvoiceLink (currency: XTR, no provider_token)
 * 2. pre_checkout_query → answerPreCheckoutQuery within 10 seconds
 * 3. successful_payment → deliver goods, store telegram_payment_charge_id
 */

import { grantStarsPro } from './tmaAccess.ts';
import type { BotConfig } from './telegramBot.ts';
import { sendPaymentSuccessMessage } from './telegramBot.ts';
import type { StarsInvoicePayload } from './starsInvoice.ts';

export type PreCheckoutQuery = {
  id: string;
  currency: string;
  total_amount: number;
  invoice_payload: string;
  from?: { id: number };
};

export type SuccessfulPayment = {
  currency: string;
  total_amount: number;
  invoice_payload: string;
  telegram_payment_charge_id: string;
  subscription_expiration_date?: number;
  is_recurring?: boolean;
};

async function callBotApi(botToken: string, method: string, body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return (await response.json()) as { ok: boolean; description?: string };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseInvoicePayload(raw: string): StarsInvoicePayload | null {
  try {
    const payload = JSON.parse(raw) as StarsInvoicePayload;
    if (!payload.user_id || payload.kind !== 'pro_monthly') {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** Step 3 — must respond within 10 seconds or Telegram cancels checkout. */
export async function answerPreCheckoutQuery(
  config: BotConfig,
  query: PreCheckoutQuery,
): Promise<void> {
  const payload = parseInvoicePayload(query.invoice_payload);

  let ok = true;
  let errorMessage: string | undefined;

  if (query.currency !== 'XTR') {
    ok = false;
    errorMessage = 'TrackIt Pro is sold exclusively in Telegram Stars (XTR).';
  } else if (!payload?.user_id) {
    ok = false;
    errorMessage = 'Invalid invoice. Open TrackIt → Statistics → Pro and try again.';
  }

  const body: Record<string, unknown> = {
    pre_checkout_query_id: query.id,
    ok,
  };
  if (!ok && errorMessage) {
    body.error_message = errorMessage;
  }

  const result = await callBotApi(config.botToken, 'answerPreCheckoutQuery', body);
  if (!result.ok) {
    console.error('[stars-payment] answerPreCheckoutQuery failed:', result.description);
  }
}

/** Step 4 — deliver Pro only after successful_payment (never on pre_checkout alone). */
export async function handleSuccessfulPayment(
  config: BotConfig,
  payment: SuccessfulPayment,
  telegramUserId: number,
  chatId: number | undefined,
): Promise<void> {
  if (payment.currency !== 'XTR') {
    console.warn('[stars-payment] Ignored non-XTR payment:', payment.currency);
    return;
  }

  const payload = parseInvoicePayload(payment.invoice_payload);
  if (!payload?.user_id) {
    console.error('[stars-payment] successful_payment with invalid payload');
    return;
  }

  const proExpiresAt = await grantStarsPro(
    payload.user_id,
    payment.total_amount,
    payment.telegram_payment_charge_id,
    telegramUserId,
    {
      subscriptionExpirationDate: payment.subscription_expiration_date,
      isRecurring: payment.is_recurring === true,
    },
  );

  if (chatId) {
    await sendPaymentSuccessMessage(config, chatId, proExpiresAt);
  }
}
