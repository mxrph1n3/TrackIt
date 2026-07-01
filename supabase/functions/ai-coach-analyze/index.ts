import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CoachRequestBody = {
  payload: Record<string, unknown>;
  prompt?: string;
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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as CoachRequestBody;
    const userPrompt =
      body.prompt?.trim() ||
      "Analyze my current TrackIt state from the JSON payload. Give today's battle plan.";

    const userMessage = `${userPrompt}\n\nUSER_PAYLOAD_JSON:\n${JSON.stringify(body.payload ?? {}, null, 2)}`;

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
