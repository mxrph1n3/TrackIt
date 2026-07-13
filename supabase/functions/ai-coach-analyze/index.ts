import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { isAppFullyFree } from '../_shared/appAccess.ts';

const COACH_SYSTEM_PROMPT = `# ROLE & IDENTITY

You are the "TrackIt AI Coach" — behavioral psychologist, trainer, financial strategist, and productivity mentor inside TrackIt.

# PERSONALITY
Analytical, direct, stoic. Gamify: tasks = quests, budget = Shield HP, savings goals = Boss Battles.

# CONSTRAINTS
- Under 150 words unless full weekly plan/menu.
- Tables and bullets over paragraphs.
- Never invent metrics not in the JSON payload.
- No medical diagnosis or trading advice.

# OUTPUT TEMPLATE

### ⚔️ CLASS OS:
*One-line discipline read.*

| Metric | Current State | Target / Status | Action |
| --- | --- | --- | --- |
| **Workout Volume** | | | |
| **Nutrition (Kcal)** | | | |
| **Financial Shield** | | | |

### 🎯 ACTIVE QUESTS & BATTLE PLAN
* **Quest 1 (STR):**
* **Quest 2 (WIS):**
* **Quest 3 (Focus):**`;

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const DEFAULT_USER_PROMPT =
  "Analyze my current TrackIt state from the JSON payload. Give today's battle plan.";
const MAX_PROMPT_LENGTH = 500;
const DAILY_AI_COACH_LIMIT = 20;
const REVENUECAT_ENTITLEMENT = 'pro';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? 'https://trackit.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CoachRequestBody = {
  payload: Record<string, unknown>;
  prompt?: string;
};

function sanitizePrompt(raw: string | undefined): string {
  const trimmed = (raw ?? '').trim().replace(/[\u0000-\u001F\u007F]/g, ' ');
  if (!trimmed) {
    return DEFAULT_USER_PROMPT;
  }
  return trimmed.slice(0, MAX_PROMPT_LENGTH);
}

async function verifyProAccess(userId: string, authHeader: string): Promise<boolean> {
  if (isAppFullyFree()) {
    return true;
  }

  const rcSecret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (rcSecret) {
    try {
      const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
        headers: {
          Authorization: `Bearer ${rcSecret}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        const entitlement = json?.subscriber?.entitlements?.[REVENUECAT_ENTITLEMENT];
        const expires = entitlement?.expires_date;
        const isActive =
          entitlement?.is_active === true ||
          (typeof expires === 'string' && new Date(expires).getTime() > Date.now());

        const serviceClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );

        await serviceClient
          .from('profiles')
          .update({
            is_pro: isActive,
            pro_expires_at: typeof expires === 'string' ? expires : null,
          })
          .eq('id', userId);

        return isActive;
      }
    } catch (error) {
      console.error('[ai-coach-analyze] RevenueCat verify failed:', error);
    }
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.rpc('user_has_premium_access', { p_user_id: userId });
  if (error) {
    console.error('[ai-coach-analyze] Pro check failed:', error.message);
    return false;
  }

  return Boolean(data);
}

async function recordUsage(userId: string): Promise<boolean> {
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count, error: countError } = await serviceClient
    .from('ai_coach_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', dayStart.toISOString());

  if (countError) {
    console.error('[ai-coach-analyze] Usage count failed:', countError.message);
    return false;
  }

  if ((count ?? 0) >= DAILY_AI_COACH_LIMIT) {
    return false;
  }

  const { error: insertError } = await serviceClient.from('ai_coach_usage').insert({ user_id: userId });
  if (insertError) {
    console.error('[ai-coach-analyze] Usage insert failed:', insertError.message);
    return false;
  }

  return true;
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

    const userId = userData.user.id;
    const isPro = await verifyProAccess(userId, authHeader);

    if (!isPro) {
      return new Response(JSON.stringify({ error: 'TrackIt Pro required for AI Coach.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowed = await recordUsage(userId);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Daily AI Coach limit reached. Try again tomorrow.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as CoachRequestBody;
    const userPrompt = sanitizePrompt(body.prompt);
    const payload =
      body.payload && typeof body.payload === 'object' && !Array.isArray(body.payload)
        ? body.payload
        : {};

    const userMessage = `${userPrompt}\n\nUSER_PAYLOAD_JSON:\n${JSON.stringify(payload, null, 2)}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: COACH_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[ai-coach-analyze] Gemini error:', errorText);
      return new Response(JSON.stringify({ error: 'AI provider error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiJson = await geminiResponse.json();
    const advice =
      geminiJson?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('') ??
      '';

    return new Response(
      JSON.stringify({
        advice,
        model: GEMINI_MODEL,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('[ai-coach-analyze] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
