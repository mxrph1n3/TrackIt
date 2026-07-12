import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { corsHeaders, TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS, validateTelegramInitData } from '../_shared/tmaAccess.ts';

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;
    const initData = body.initData?.trim() ?? '';
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const starsPrice = Number.parseInt(Deno.env.get('TMA_STARS_PRICE') ?? '250', 10);

    if (!initData || !botToken) {
      return new Response(JSON.stringify({ error: 'Telegram init data or bot token missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { valid } = await validateTelegramInitData(initData, botToken);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram init data' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({ user_id: userData.user.id, kind: 'pro_monthly' });

    const invoiceResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'TrackIt Pro',
          description:
            'Monthly subscription — AI Coach, analytics, Telegram reminders, and premium themes. Renews every month via Telegram Stars.',
          payload,
          currency: 'XTR',
          subscription_period: TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS,
          prices: [{ label: 'TrackIt Pro (monthly)', amount: starsPrice }],
        }),
      },
    );

    const invoiceJson = await invoiceResponse.json();
    if (!invoiceResponse.ok || !invoiceJson.ok || !invoiceJson.result) {
      console.error('[telegram-create-invoice] Bot API error:', invoiceJson);
      return new Response(JSON.stringify({ error: 'Could not create Stars invoice' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ invoiceUrl: invoiceJson.result as string }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[telegram-create-invoice] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
