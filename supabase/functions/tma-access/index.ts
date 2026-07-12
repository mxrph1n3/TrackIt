import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import {
  buildAccessPayload,
  corsHeaders,
  getServiceClient,
  validateTelegramInitData,
} from '../_shared/tmaAccess.ts';

type RequestBody = {
  initData?: string;
  timezone?: string;
};

function resolveTimezone(body: RequestBody): string {
  const candidate = body.timezone?.trim();
  if (!candidate || candidate.length > 64) {
    return 'UTC';
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return 'UTC';
  }
}

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

    if (!initData || !botToken) {
      return new Response(JSON.stringify({ error: 'Telegram init data or bot token missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user: telegramUser, valid } = await validateTelegramInitData(initData, botToken);
    if (!valid || !telegramUser?.id) {
      return new Response(JSON.stringify({ error: 'Invalid Telegram init data' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    const service = getServiceClient();

    const { data: profile, error: profileError } = await service
      .from('profiles')
      .select(
        'id, is_pro, pro_expires_at, tma_trial_started_at, telegram_user_id, telegram_reminders_enabled',
      )
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const updates: Record<string, unknown> = {
      telegram_user_id: telegramUser.id,
      timezone: resolveTimezone(body),
      last_active_at: new Date().toISOString(),
    };

    if (!profile.tma_trial_started_at) {
      updates.tma_trial_started_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await service
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(
        'is_pro, pro_expires_at, tma_trial_started_at, telegram_user_id, telegram_reminders_enabled',
      )
      .single();

    if (updateError || !updated) {
      return new Response(JSON.stringify({ error: 'Could not sync TMA access' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(buildAccessPayload(updated)), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[tma-access] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
