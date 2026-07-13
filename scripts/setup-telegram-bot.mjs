#!/usr/bin/env node
/**
 * Configure TrackIt Telegram bot metadata and webhook via Bot API.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=... \
 *   TMA_WEB_APP_URL=https://track-it-umber-psi.vercel.app \
 *   SUPABASE_PROJECT_REF=vvdakzkcfnmczddukgtg \
 *   node scripts/setup-telegram-bot.mjs
 */

const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
const webAppUrl = (
  process.env.TMA_WEB_APP_URL ||
  process.env.EXPO_PUBLIC_WEB_APP_URL ||
  'https://track-it-umber-psi.vercel.app'
).replace(/\/$/, '');
const projectRef = process.env.SUPABASE_PROJECT_REF?.trim() || 'vvdakzkcfnmczddukgtg';
const starsPrice = Number.parseInt(process.env.TMA_STARS_PRICE ?? '300', 10);
const monthlyPriceLabel = process.env.TMA_MONTHLY_PRICE_LABEL?.trim() || '$5.99/month';

const BOT_COMMANDS = [
  { command: 'start', description: 'Welcome message and main menu' },
  { command: 'app', description: 'Open the TrackIt Mini App' },
  { command: 'pro', description: 'Subscribe to TrackIt Pro with Stars' },
  { command: 'status', description: 'Check trial or subscription status' },
  { command: 'paysupport', description: 'Help with Telegram Stars payments' },
  { command: 'terms', description: 'Subscription terms' },
  { command: 'help', description: 'How TrackIt and Stars billing work' },
];

const BOT_DESCRIPTION = `TrackIt — your productivity companion inside Telegram.

📋 Plan tasks & daily goals
💪 Log workouts & track progress
🍎 Nutrition, habits & finance
🤖 AI Coach & analytics (Pro)

Open the Mini App for a free 3-day Pro trial. After that, subscribe at ${monthlyPriceLabel} (paid with Telegram Stars at checkout).

Smart reminders are delivered right here in chat — morning motivation, task nudges, workout prompts, and evening wrap-ups (08:00–22:00). Enable them in Settings → Telegram Reminders.`;

const BOT_SHORT_DESCRIPTION =
  'Tasks, workouts & habits in Telegram. 3-day Pro trial, then 250 Stars/month. Chat reminders included.';

if (!botToken) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

/** Telegram tokens are `<bot_id>:<secret>` — ASCII digits only before the colon. */
function validateBotToken(token) {
  if (/[^\x00-\x7F]/.test(token)) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN contains non-ASCII characters (often a Cyrillic "Т" pasted before the digits). Copy the token again from @BotFather — it must start with digits only, e.g. 8720588601:AAH...',
    );
  }
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN format looks wrong. Expected `<bot_id>:<secret>` from @BotFather (no quotes, spaces, or extra characters).',
    );
  }
}

async function callBotApi(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!json.ok) {
    if (json.description === 'Not Found' || response.status === 404) {
      throw new Error(
        `${method} failed: Telegram returned Not Found (unknown method or bad token). If getMe worked, check the method name in scripts/setup-telegram-bot.mjs.`,
      );
    }
    throw new Error(`${method} failed: ${json.description ?? response.statusText}`);
  }
  return json.result;
}

async function main() {
  validateBotToken(botToken);

  console.log('Configuring TrackIt Telegram bot…');
  console.log(`Mini App URL: ${webAppUrl}`);
  console.log(`Stars price: ${starsPrice}/month`);

  const me = await callBotApi('getMe', {});
  console.log(`✓ Token OK — bot @${me.username} (${me.first_name})`);

  await callBotApi('setMyCommands', { commands: BOT_COMMANDS });
  console.log('✓ Bot commands set');

  await callBotApi('setMyDescription', { description: BOT_DESCRIPTION, language_code: 'en' });
  console.log('✓ Bot description set');

  await callBotApi('setMyShortDescription', {
    short_description: BOT_SHORT_DESCRIPTION,
    language_code: 'en',
  });
  console.log('✓ Short description set');

  await callBotApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Open TrackIt',
      web_app: { url: webAppUrl },
    },
  });
  console.log('✓ Menu button → Open TrackIt');

  const webhookUrl = `https://${projectRef}.supabase.co/functions/v1/telegram-webhook`;
  await callBotApi('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query', 'pre_checkout_query'],
    drop_pending_updates: true,
  });
  console.log(`✓ Webhook → ${webhookUrl}`);

  const info = await callBotApi('getWebhookInfo', {});
  console.log('Webhook info:', JSON.stringify(info, null, 2));

  console.log(`Direct Mini App link: https://t.me/${me.username}/app`);

  console.log('Syncing TELEGRAM_BOT_TOKEN to Supabase Edge Function secrets…');
  try {
    const { spawnSync } = await import('node:child_process');
    const result = spawnSync(
      'npx',
      [
        'supabase',
        'secrets',
        'set',
        `TELEGRAM_BOT_TOKEN=${botToken}`,
        `TMA_WEB_APP_URL=${webAppUrl}`,
        `TMA_STARS_PRICE=${starsPrice}`,
      ],
      { stdio: 'inherit', env: process.env },
    );
    if (result.status === 0) {
      console.log('✓ Supabase secrets updated (TELEGRAM_BOT_TOKEN, TMA_WEB_APP_URL, TMA_STARS_PRICE)');
    } else {
      console.warn('⚠ Could not auto-sync Supabase secrets. Run manually:');
      console.warn('  npx supabase secrets set TELEGRAM_BOT_TOKEN="<your token from BotFather>"');
    }
  } catch {
    console.warn('⚠ Could not auto-sync Supabase secrets. Run manually:');
    console.warn('  npx supabase secrets set TELEGRAM_BOT_TOKEN="<your token from BotFather>"');
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
