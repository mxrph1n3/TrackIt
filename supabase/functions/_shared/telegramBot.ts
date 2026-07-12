import {
  buildAccessPayload,
  getServiceClient,
} from './tmaAccess.ts';
import { ensureTelegramUserAccount, type TelegramChatUser } from './tmaAuth.ts';
import { PAYMENT_SUCCESS_MESSAGE } from './starsInvoice.ts';

type InlineKeyboardButton = {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
};

type ReplyMarkup = {
  inline_keyboard: InlineKeyboardButton[][];
};

type TelegramApiResponse<T = unknown> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export type BotConfig = {
  botToken: string;
  webAppUrl: string;
  starsPrice: number;
};

export function getBotConfig(): BotConfig | null {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')?.trim();
  if (!botToken) return null;

  const webAppUrl =
    Deno.env.get('TMA_WEB_APP_URL')?.trim() ||
    Deno.env.get('ALLOWED_ORIGIN')?.trim() ||
    'https://track-it-umber-psi.vercel.app';

  const starsPrice = Number.parseInt(Deno.env.get('TMA_STARS_PRICE') ?? '250', 10);

  return { botToken, webAppUrl: webAppUrl.replace(/\/$/, ''), starsPrice };
}

async function callBotApi<T>(
  botToken: string,
  method: string,
  body: Record<string, unknown>,
): Promise<TelegramApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    return (await response.json()) as TelegramApiResponse<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendBotMessage(
  config: BotConfig,
  chatId: number,
  text: string,
  replyMarkup?: ReplyMarkup,
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const result = await callBotApi(config.botToken, 'sendMessage', payload);
  if (!result.ok) {
    const reason = result.description ?? 'Unknown Telegram API error';
    console.error('[telegram-bot] sendMessage failed:', reason);
    throw new Error(`sendMessage failed: ${reason}`);
  }
}

export async function answerCallbackQuery(
  config: BotConfig,
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  const payload: Record<string, unknown> = { callback_query_id: callbackQueryId };
  if (text) payload.text = text;

  const result = await callBotApi(config.botToken, 'answerCallbackQuery', payload);
  if (!result.ok) {
    console.error('[telegram-bot] answerCallbackQuery failed:', result.description);
  }
}

function buildPremiumPurchaseGuideMessage(config: BotConfig): string {
  return [
    '<b>How to buy TrackIt Pro</b>',
    '',
    'Stars checkout works <b>inside the Mini App only</b> — not in this chat.',
    '',
    '1️⃣ Tap <b>Open TrackIt</b> below.',
    '2️⃣ Open the <b>Statistics</b> tab (bottom navigation).',
    '3️⃣ Tap <b>Pro</b> on the upgrade banner.',
    `4️⃣ Pay <b>${config.starsPrice} Telegram Stars / month</b>.`,
    '',
    'Your Pro access activates right after payment.',
  ].join('\n');
}

function buildMainKeyboard(config: BotConfig): ReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: '🚀 Open TrackIt', web_app: { url: config.webAppUrl } }],
      [{ text: `⭐ Buy Premium — ${config.starsPrice} Stars`, callback_data: 'buy_premium' }],
      [
        { text: '📊 My status', callback_data: 'check_status' },
        { text: '❓ Help', callback_data: 'show_help' },
      ],
    ],
  };
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> {
  let timeoutId: number | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`[telegram-bot] ${label} timed out after ${ms}ms`);
      resolve(null);
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

function warmEnsureTelegramUserAccount(telegramUser: TelegramChatUser): void {
  void withTimeout(ensureTelegramUserAccount(telegramUser), 8000, 'ensureTelegramUserAccount').catch(
    (error) => {
      console.error('[telegram-bot] ensureTelegramUserAccount failed:', error);
    },
  );
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function getProfileByTelegramUserId(telegramUserId: number) {
  const service = getServiceClient();
  return service
    .from('profiles')
    .select(
      'id, is_pro, pro_expires_at, tma_trial_started_at, telegram_user_id, telegram_reminders_enabled',
    )
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle();
}

function formatStatusMessage(
  firstName: string | undefined,
  row: {
    is_pro: boolean;
    pro_expires_at: string | null;
    tma_trial_started_at: string | null;
    telegram_reminders_enabled: boolean;
    telegram_user_id: number | null;
  },
  starsPrice: number,
): string {
  const access = buildAccessPayload(row);
  const greeting = firstName ? `<b>${escapeHtml(firstName)}</b>, here is your TrackIt access:` : 'Your TrackIt access:';

  if (access.hasStarsSubscription) {
    const expiry = access.proExpiresAt
      ? new Date(access.proExpiresAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'active';
    return `${greeting}\n\n✅ <b>TrackIt Pro</b> is active.\nRenews monthly via Telegram Stars.\nPro valid until: <b>${escapeHtml(String(expiry))}</b>`;
  }

  if (access.isInTrial) {
    return `${greeting}\n\n🎁 <b>Free trial</b> — ${access.trialDaysRemaining} day(s) left.\nYou have full Pro access and Telegram reminders during the trial.\n\nAfter the trial, subscribe in the Mini App → <b>Statistics</b> → <b>Pro</b>.`;
  }

  return `${greeting}\n\n🔒 Your free trial has ended.\nOpen the Mini App → <b>Statistics</b> → <b>Pro</b> to subscribe with Stars (${starsPrice}/month).`;
}

export function buildStartMessage(firstName?: string, starsPrice = 250): string {
  const greeting = firstName ? `Hi ${escapeHtml(firstName)}!\n\n` : '';
  return [
    `${greeting}Welcome to <b>TrackIt</b>! 🎯 Your ultimate habit tracker right inside Telegram. Click the button below to start tracking your progress.`,
    '',
    `🎁 <b>3-day free trial</b> with full Pro access.`,
    `After the trial — <b>${starsPrice} Stars/month</b> in the Mini App (Statistics → Pro).`,
  ].join('\n');
}

export function buildHelpMessage(config: BotConfig): string {
  return [
    '<b>How TrackIt works</b>',
    '',
    '1️⃣ Tap <b>Open TrackIt</b> to launch the Mini App.',
    '2️⃣ Your Telegram account is linked automatically — no password needed.',
    '3️⃣ Enjoy a <b>3-day Pro trial</b> with all features.',
    '4️⃣ Turn on <b>Telegram Reminders</b> in Settings — nudges arrive here in chat (08:00–22:00).',
    `5️⃣ After the trial, subscribe in the Mini App → <b>Statistics</b> → <b>Pro</b> (${config.starsPrice} Stars / month).`,
    '',
    '<b>Payment</b>',
    'Stars checkout works only inside the Mini App — not in this chat. Use /pro for step-by-step instructions.',
    '',
    '<b>Reminder schedule</b>',
    '08:00 Morning · 12:00 Midday · 16:00 Progress',
    '19:00 Evening · 21:00 Summary · 22:00 Final nudge',
    '',
    '<b>Commands</b>',
    '/start — Welcome message and main menu',
    '/app — Open the Mini App',
    '/pro — How to buy TrackIt Pro in the Mini App',
    '/status — Check trial or subscription status',
    '/help — Show this guide',
  ].join('\n');
}

export async function handleStartCommand(
  config: BotConfig,
  chatId: number,
  telegramUser: TelegramChatUser,
): Promise<void> {
  await sendBotMessage(
    config,
    chatId,
    buildStartMessage(telegramUser.first_name, config.starsPrice),
    buildMainKeyboard(config),
  );
  warmEnsureTelegramUserAccount(telegramUser);
}

export async function handleHelpCommand(config: BotConfig, chatId: number): Promise<void> {
  await sendBotMessage(config, chatId, buildHelpMessage(config), buildMainKeyboard(config));
}

export async function handlePaySupportCommand(config: BotConfig, chatId: number): Promise<void> {
  await sendBotMessage(
    config,
    chatId,
    [
      '<b>Payment support</b>',
      '',
      'TrackIt Pro is billed monthly via <b>Telegram Stars</b> (currency XTR).',
      '',
      '• Payment issues: describe your problem here in this chat.',
      '• Subscription status: /status',
      '• Buy or renew Pro: open Mini App → Statistics → Pro (or /pro for steps)',
      '',
      'Telegram Support cannot help with in-bot Star purchases — contact us via this bot.',
    ].join('\n'),
    buildMainKeyboard(config),
  );
}

export async function handleTermsCommand(config: BotConfig, chatId: number): Promise<void> {
  await sendBotMessage(
    config,
    chatId,
    [
      '<b>TrackIt Pro — Terms</b>',
      '',
      `• <b>Product:</b> TrackIt Pro — digital subscription (AI Coach, analytics, reminders).`,
      `• <b>Price:</b> ${config.starsPrice} Telegram Stars per month (XTR).`,
      '• <b>Billing:</b> Renews automatically via Telegram Stars until cancelled in Telegram → Settings → Stars.',
      '• <b>Delivery:</b> Pro access is activated immediately after successful payment in the Mini App.',
      '• <b>Refunds:</b> Contact /paysupport — refunds are processed per Telegram Stars policy.',
      '',
      'By paying, you agree to these terms.',
    ].join('\n'),
    buildMainKeyboard(config),
  );
}

export async function handleAppCommand(config: BotConfig, chatId: number): Promise<void> {
  await sendBotMessage(
    config,
    chatId,
    '🚀 Tap the button below to open TrackIt in Telegram.',
    {
      inline_keyboard: [[{ text: '🚀 Open TrackIt', web_app: { url: config.webAppUrl } }]],
    },
  );
}

export async function handleStatusCommand(
  config: BotConfig,
  chatId: number,
  telegramUser: TelegramChatUser,
): Promise<void> {
  const linked = await withTimeout(ensureTelegramUserAccount(telegramUser), 8000, 'ensureTelegramUserAccount');
  if (!linked) {
    await sendBotMessage(
      config,
      chatId,
      'Tap <b>Open TrackIt</b> first, then try /status again.',
      buildMainKeyboard(config),
    );
    return;
  }

  const { data: profile, error } = await getProfileByTelegramUserId(telegramUser.id);
  if (error || !profile) {
    await sendBotMessage(
      config,
      chatId,
      'Could not load your status. Tap Open TrackIt first, then try /status again.',
      buildMainKeyboard(config),
    );
    return;
  }

  await sendBotMessage(
    config,
    chatId,
    formatStatusMessage(telegramUser.first_name, profile, config.starsPrice),
    buildMainKeyboard(config),
  );
}

export async function handleProCommand(
  config: BotConfig,
  chatId: number,
  _telegramUser: TelegramChatUser,
): Promise<void> {
  await sendBotMessage(
    config,
    chatId,
    buildPremiumPurchaseGuideMessage(config),
    buildMainKeyboard(config),
  );
}

export async function handleCallbackQuery(
  config: BotConfig,
  callbackQueryId: string,
  chatId: number,
  data: string,
  telegramUser: TelegramChatUser,
): Promise<void> {
  if (data === 'subscribe_pro' || data === 'buy_premium') {
    await answerCallbackQuery(config, callbackQueryId, 'Open the Mini App to pay');
    await sendBotMessage(
      config,
      chatId,
      buildPremiumPurchaseGuideMessage(config),
      buildMainKeyboard(config),
    );
    return;
  }

  if (data === 'check_status') {
    await answerCallbackQuery(config, callbackQueryId);
    await handleStatusCommand(config, chatId, telegramUser);
    return;
  }

  if (data === 'show_help') {
    await answerCallbackQuery(config, callbackQueryId);
    await handleHelpCommand(config, chatId);
    return;
  }

  await answerCallbackQuery(config, callbackQueryId);
}

export async function sendPaymentSuccessMessage(
  config: BotConfig,
  chatId: number,
  proExpiresAt: string,
): Promise<void> {
  const expiry = new Date(proExpiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  await sendBotMessage(
    config,
    chatId,
    [
      PAYMENT_SUCCESS_MESSAGE,
      '',
      `Pro access is valid until <b>${escapeHtml(expiry)}</b> and renews monthly.`,
      '',
      'Tap Open TrackIt below to continue.',
    ].join('\n'),
    buildMainKeyboard(config),
  );
}

export const BOT_COMMANDS = [
  { command: 'start', description: 'Welcome message and main menu' },
  { command: 'app', description: 'Open the TrackIt Mini App' },
  { command: 'pro', description: 'How to buy TrackIt Pro in the Mini App' },
  { command: 'status', description: 'Check trial or subscription status' },
  { command: 'paysupport', description: 'Help with Telegram Stars payments' },
  { command: 'terms', description: 'Subscription terms' },
  { command: 'help', description: 'How TrackIt and Stars billing work' },
];

export const BOT_DESCRIPTION = `TrackIt — your productivity companion inside Telegram.

📋 Plan tasks & daily goals
💪 Log workouts & track progress
🍎 Nutrition, habits & finance
🤖 AI Coach & analytics (Pro)

Open the Mini App for a free 3-day Pro trial. After that, subscribe monthly with Telegram Stars.

Smart reminders are delivered right here in chat — morning motivation, task nudges, workout prompts, and evening wrap-ups (08:00–22:00). Enable them in Settings → Telegram Reminders.`;

export const BOT_SHORT_DESCRIPTION =
  'Tasks, workouts & habits in Telegram. 3-day Pro trial, then 250 Stars/month. Chat reminders included.';
