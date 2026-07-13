import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { corsHeaders, getServiceClient } from '../_shared/tmaAccess.ts';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing authorization' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const userId = userData.user.id;
    const service = getServiceClient();

    // User tables cascade from auth.users (on delete cascade in migrations).
    const { error: deleteError } = await service.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('[delete-account] deleteUser failed:', deleteError.message);
      return json({ error: 'Could not delete account' }, 500);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error('[delete-account] Unexpected error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});
