import { corsHeaders } from '../_shared/tmaAccess.ts';
import { processTelegramReminders } from '../_shared/telegramReminders.ts';

function isAuthorized(req: Request): boolean {
  const cronSecret = Deno.env.get('CRON_SECRET')?.trim();
  if (!cronSecret) {
    return true;
  }

  const authHeader = req.headers.get('Authorization')?.trim();
  return authHeader === `Bearer ${cronSecret}`;
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

  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await processTelegramReminders();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[telegram-send-reminders] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
