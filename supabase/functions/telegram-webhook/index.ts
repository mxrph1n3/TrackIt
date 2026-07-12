import { grantStarsPro } from '../_shared/tmaAccess.ts';

type TelegramUpdate = {
  pre_checkout_query?: {
    id: string;
  };
  message?: {
    successful_payment?: {
      currency: string;
      total_amount: number;
      invoice_payload: string;
      telegram_payment_charge_id: string;
      subscription_expiration_date?: number;
      is_recurring?: boolean;
    };
    from?: {
      id: number;
    };
  };
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    return new Response('Bot token not configured', { status: 500 });
  }

  try {
    const update = (await req.json()) as TelegramUpdate;

    if (update.pre_checkout_query?.id) {
      await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pre_checkout_query_id: update.pre_checkout_query.id, ok: true }),
      });
      return new Response('ok');
    }

    const payment = update.message?.successful_payment;
    if (!payment || payment.currency !== 'XTR') {
      return new Response('ok');
    }

    let payload: { user_id?: string } = {};
    try {
      payload = JSON.parse(payment.invoice_payload) as { user_id?: string };
    } catch {
      console.error('[telegram-webhook] Invalid invoice payload');
      return new Response('ok');
    }

    const userId = payload.user_id;
    const telegramUserId = update.message?.from?.id;
    if (!userId || !telegramUserId) {
      return new Response('ok');
    }

    await grantStarsPro(
      userId,
      payment.total_amount,
      payment.telegram_payment_charge_id,
      telegramUserId,
      {
        subscriptionExpirationDate: payment.subscription_expiration_date,
        isRecurring: payment.is_recurring === true,
      },
    );

    return new Response('ok');
  } catch (error) {
    console.error('[telegram-webhook] Unexpected error:', error);
    return new Response('error', { status: 500 });
  }
});
