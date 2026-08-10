import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'https://trackit.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const userId = userData.user.id;
    const body = (await req.json().catch(() => ({}))) as {
      isPro?: boolean;
      expiresAt?: string | null;
    };

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Client reports store entitlement after native IAP purchase/restore.
    if (typeof body.isPro === 'boolean') {
      const expiresAt =
        typeof body.expiresAt === 'string' || body.expiresAt === null ? body.expiresAt : null;

      await serviceClient
        .from('profiles')
        .update({
          is_pro: body.isPro,
          pro_expires_at: expiresAt,
        })
        .eq('id', userId);

      return new Response(
        JSON.stringify({ isPro: body.isPro, synced: true, expiresAt }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('is_pro, pro_expires_at')
      .eq('id', userId)
      .maybeSingle();

    const expires = profile?.pro_expires_at ?? null;
    const isPro =
      profile?.is_pro === true ||
      (typeof expires === 'string' && new Date(expires).getTime() > Date.now());

    return new Response(JSON.stringify({ isPro, synced: false, expiresAt: expires }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[sync-subscription-status] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
