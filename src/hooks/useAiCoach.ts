import { useCallback, useState } from 'react';

import { AiCoachError, fetchAiCoachAdvice } from '../lib/ai/coachService';
import { useGamificationStore } from '../stores/useGamificationStore';

export function useAiCoach() {
  const userId = useGamificationStore((s) => s.profile?.id);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (prompt?: string) => {
      if (!userId) {
        setError('Sign in to use AI Coach.');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchAiCoachAdvice({ userId, prompt });
        setAdvice(result);
        return result;
      } catch (caught) {
        const message =
          caught instanceof AiCoachError
            ? caught.message
            : caught instanceof Error
              ? caught.message
              : 'Could not reach AI Coach.';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const clear = useCallback(() => {
    setAdvice(null);
    setError(null);
  }, []);

  return {
    advice,
    isLoading,
    error,
    analyze,
    clear,
  };
}
