import { useMemo } from 'react';

import {
  buildHeartRateProfile,
  DEFAULT_HEART_RATE_INPUT,
} from '../lib/health/heartRateEngine';
import { useGamificationStore } from '../stores/useGamificationStore';
import type { HeartRateProfile } from '../types/workout';

export function useHeartRateProfile(): HeartRateProfile {
  const profile = useGamificationStore((s) => s.profile);

  return useMemo(() => {
    const age = profile?.age ?? DEFAULT_HEART_RATE_INPUT.age;
    const gender =
      profile?.gender === 'female' ? 'female' : DEFAULT_HEART_RATE_INPUT.gender;

    return buildHeartRateProfile({ age, gender });
  }, [profile?.age, profile?.gender]);
}
