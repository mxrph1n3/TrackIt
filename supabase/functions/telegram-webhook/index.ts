import {
  getBotConfig,
  handleAppCommand,
  handleCallbackQuery,
  handleHelpCommand,
  handlePaySupportCommand,
  handleProCommand,
  handleStartCommand,
  handleStatusCommand,
  handleTermsCommand,
} from '../_shared/telegramBot.ts';
import {
  answerPreCheckoutQuery,
  handleSuccessfulPayment,
  type PreCheckoutQuery,
} from '../_shared/starsPayment.ts';
import type { TelegramChatUser } from '../_shared/tmaAuth.ts';

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

type TelegramUpdate = {
  update_id?: number;
  pre_checkout_query?: PreCheckoutQuery;
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      chat?: {
        id: number;
      };
    };
    from?: TelegramChatUser;
  };
  message?: {
    message_id?: number;
    text?: string;
    chat?: {
      id: number;
    };
    from?: TelegramChatUser;
    successful_payment?: {
      currency: string;
      total_amount: number;
      invoice_payload: string;
      telegram_payment_charge_id: string;
      subscription_expiration_date?: number;
      is_recurring?: boolean;
    };
  };
};

function normalizeCommand(text: string): string {
  const firstToken = text.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const atIndex = firstToken.indexOf('@');
  return atIndex >= 0 ? firstToken.slice(0, atIndex) : firstToken;
}

async function handleBotMessage(
  config: NonNullable<ReturnType<typeof getBotConfig>>,
  update: TelegramUpdate,
): Promise<void> {
  const message = update.message;
  const chatId = message?.chat?.id;
  const telegramUser = message?.from;
  const text = message?.text?.trim();

  if (!chatId || !telegramUser?.id || !text) {
    return;
  }

  const command = normalizeCommand(text);

  switch (command) {
    case '/start':
      await handleStartCommand(config, chatId, telegramUser);
      return;
    case '/help':
      await handleHelpCommand(config, chatId);
      return;
    case '/app':
      await handleAppCommand(config, chatId);
      return;
    case '/pro':
    case '/subscribe':
      await handleProCommand(config, chatId, telegramUser);
      return;
    case '/status':
      await handleStatusCommand(config, chatId, telegramUser);
      return;
    case '/paysupport':
      await handlePaySupportCommand(config, chatId);
      return;
    case '/terms':
      await handleTermsCommand(config, chatId);
      return;
    default:
      if (text.startsWith('/')) {
        await handleHelpCommand(config, chatId);
        return;
      }
      await handleStartCommand(config, chatId, telegramUser);
  }
}

async function processBotUpdate(
  config: NonNullable<ReturnType<typeof getBotConfig>>,
  update: TelegramUpdate,
): Promise<void> {
  const callback = update.callback_query;
  if (callback?.id && callback.from?.id) {
    const chatId = callback.message?.chat?.id ?? callback.from.id;
    await handleCallbackQuery(config, callback.id, chatId, callback.data ?? '', callback.from);
    return;
  }

  await handleBotMessage(config, update);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const config = getBotConfig();
  if (!config) {
    console.error('[telegram-webhook] TELEGRAM_BOT_TOKEN is missing in Supabase secrets');
    return new Response('Bot token not configured', { status: 500 });
  }

  try {
    const update = (await req.json()) as TelegramUpdate;

    // Stars checkout — answer synchronously (Telegram deadline: 10 seconds).
    if (update.pre_checkout_query?.id) {
      await answerPreCheckoutQuery(config, update.pre_checkout_query);
      return new Response('ok');
    }

    // Stars payment confirmed — grant Pro before acknowledging webhook.
    const payment = update.message?.successful_payment;
    if (payment?.currency === 'XTR') {
      const telegramUserId = update.message?.from?.id;
      if (telegramUserId) {
        await handleSuccessfulPayment(
          config,
          payment,
          telegramUserId,
          update.message?.chat?.id,
        );
      }
      return new Response('ok');
    }

    const work = processBotUpdate(config, update).catch((error) => {
      console.error('[telegram-webhook] Update processing failed:', error);
    });

    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(work);
      return new Response('ok');
    }

    await work;
    return new Response('ok');
  } catch (error) {
    console.error('[telegram-webhook] Unexpected error:', error);
    return new Response('ok');
  }
});
