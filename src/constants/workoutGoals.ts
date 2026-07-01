import { Dumbbell, Flame, Scale } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import type { WorkoutTrackId } from '../types/workout';

export type WorkoutGoalOption = {
  id: WorkoutTrackId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
};

/** Shown before every workout session. */
export const WORKOUT_GOAL_OPTIONS: WorkoutGoalOption[] = [
  {
    id: 'mass_gain',
    title: 'Mass Gain',
    subtitle: 'Build muscle and strength volume',
    icon: Dumbbell,
  },
  {
    id: 'maintenance',
    title: 'Full Body Beginner',
    subtitle: 'Free program · stay in shape and build the habit',
    icon: Scale,
  },
  {
    id: 'fat_loss',
    title: 'Fat Loss',
    subtitle: 'Burn fat with cardio and supersets',
    icon: Flame,
  },
];
