import { corsHeaders, getServiceClient, validateTelegramInitData } from '../_shared/tmaAccess.ts';
import { getBotConfig, sendBotMessage } from '../_shared/telegramBot.ts';

type RequestBody = {
  initData?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const config = getBotConfig();
    if (!config) {
      return new Response(JSON.stringify({ error: 'Bot not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;
    const initData = body.initData?.trim() ?? '';
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!initData || !botToken) {
      return new Response(JSON.stringify({ error: 'Missing init data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user: telegramUser, valid } = await validateTelegramInitData(initData, botToken);
    if (!valid || !telegramUser?.id) {
      return new Response(JSON.stringify({ error: 'Invalid init data' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const service = getServiceClient();
    const { data: profile } = await service
      .from('profiles')
      .select('telegram_reminders_enabled')
      .eq('telegram_user_id', telegramUser.id)
      .maybeSingle();

    if (!profile?.telegram_reminders_enabled) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await sendBotMessage(
      config,
      telegramUser.id,
      [
        '🔔 <b>Telegram reminders are on!</b>',
        '',
        'You will receive the same smart nudges as in the native app — delivered here in chat:',
        '08:00 Morning · 12:00 Midday · 16:00 Progress',
        '19:00 Evening · 21:00 Summary · 22:00 Final nudge',
        '',
        'Tap below anytime to open TrackIt.',
      ].join('\n'),
      {
        inline_keyboard: [[{ text: '🚀 Open TrackIt', web_app: { url: config.webAppUrl } }]],
      },
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[telegram-reminder-welcome] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
