import { DEFAULT_COACH_USER_PROMPT } from './coachSystemPrompt';
import { buildCoachPayload } from './buildCoachPayload';
import { isSupabaseConfigured, supabase } from '../supabase';
import type { AiCoachAnalyzeResponse, TrackItCoachPayload } from './types';

export class AiCoachError extends Error {
  constructor(
    message: string,
    readonly code: 'not_configured' | 'unauthorized' | 'provider' | 'network' = 'provider',
  ) {
    super(message);
    this.name = 'AiCoachError';
  }
}

export async function fetchAiCoachAdvice(options?: {
  userId?: string;
  prompt?: string;
  payload?: TrackItCoachPayload;
}): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new AiCoachError(
      'AI Coach requires Supabase. Set EXPO_PUBLIC_SUPABASE_URL and deploy the ai-coach-analyze function.',
      'not_configured',
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = options?.userId ?? session?.user?.id;
  if (!userId) {
    throw new AiCoachError('Sign in to use AI Coach.', 'unauthorized');
  }

  const payload = options?.payload ?? (await buildCoachPayload(userId));
  const prompt = options?.prompt?.trim() || DEFAULT_COACH_USER_PROMPT;

  const { data, error } = await supabase.functions.invoke<AiCoachAnalyzeResponse>('ai-coach-analyze', {
    body: { payload, prompt },
  });

  if (error) {
    throw new AiCoachError(error.message || 'AI Coach request failed.', 'network');
  }

  if (!data?.advice?.trim()) {
    throw new AiCoachError('AI Coach returned an empty response.', 'provider');
  }

  return data.advice.trim();
}
