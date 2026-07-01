import type { HeartRateProfile, HeartRateZone } from '../../types/workout';

export type HeartRateInput = {
  age: number;
  gender: 'male' | 'female';
};

const ZONE_DEFINITIONS: Array<Omit<HeartRateZone, 'minBpm' | 'maxBpm'>> = [
  {
    zone: 1,
    name: 'Recovery / Warm-up',
    minPercent: 60,
    maxPercent: 70,
    purpose: 'Warm-up, cool-down, heart prep',
  },
  {
    zone: 2,
    name: 'Fat burn / Endurance',
    minPercent: 70,
    maxPercent: 80,
    purpose: 'Long cardio, fat loss track',
  },
  {
    zone: 3,
    name: 'Aerobic / Strength',
    minPercent: 80,
    maxPercent: 90,
    purpose: 'Strength training, recomposition, mass',
  },
  {
    zone: 4,
    name: 'Anaerobic / Peak',
    minPercent: 90,
    maxPercent: 100,
    purpose: 'HIIT workloads (limited)',
  },
];

export function calculateMaxHeartRate({ age, gender }: HeartRateInput): number {
  const safeAge = Math.min(100, Math.max(13, age));
  return gender === 'female' ? 226 - safeAge : 220 - safeAge;
}

export function buildHeartRateProfile(input: HeartRateInput): HeartRateProfile {
  const maxHr = calculateMaxHeartRate(input);

  const zones: HeartRateZone[] = ZONE_DEFINITIONS.map((zone) => ({
    ...zone,
    minBpm: Math.round(maxHr * (zone.minPercent / 100)),
    maxBpm: Math.round(maxHr * (zone.maxPercent / 100)),
  }));

  return {
    maxHr,
    age: input.age,
    gender: input.gender,
    zones,
  };
}

export function formatZoneRange(zone: HeartRateZone): string {
  return `${zone.minBpm}–${zone.maxBpm} bpm`;
}

export function zonesForCardio(trackId: 'fat_loss' | 'maintenance' | 'mass_gain'): number[] {
  if (trackId === 'fat_loss') return [1, 2];
  if (trackId === 'maintenance') return [1, 2, 3];
  return [2, 3];
}

export const DEFAULT_HEART_RATE_INPUT: HeartRateInput = { age: 25, gender: 'male' };
