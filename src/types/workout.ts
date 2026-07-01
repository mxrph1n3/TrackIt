/** Muscle IDs for SVG body highlighter. */
export type MuscleId =
  | 'chest'
  | 'lats'
  | 'trapezius'
  | 'lower_back'
  | 'deltoids'
  | 'quadriceps'
  | 'glutes'
  | 'hamstrings'
  | 'calves'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'obliques'
  | 'core'
  | 'forearms'
  | 'abs_anterior';

export type WorkoutTrackId = 'maintenance' | 'fat_loss' | 'mass_gain';

export type BodyView = 'front' | 'back';

export type ProgramExerciseTemplate = {
  name: string;
  setsCount: number;
  repsTarget: string;
  intensityPercentage?: number;
  restSeconds?: number;
  isCardio?: boolean;
  cardioDurationMinutes?: number;
  cardioNotes?: string;
  targetHeartRateZones?: number[];
  primaryMuscles: MuscleId[];
  secondaryMuscles?: MuscleId[];
  dropSetPercents?: number[];
};

export type ProgramDay = {
  weekNumber: number;
  dayNumber: number;
  focusName: string;
  notes?: string[];
  exercises: ProgramExerciseTemplate[];
};

export type WorkoutTrack = {
  id: WorkoutTrackId;
  slug: string;
  title: string;
  description: string;
  durationWeeks: number;
  days: ProgramDay[];
};

export type HeartRateZone = {
  zone: 1 | 2 | 3 | 4;
  name: string;
  minPercent: number;
  maxPercent: number;
  minBpm: number;
  maxBpm: number;
  purpose: string;
};

export type HeartRateProfile = {
  maxHr: number;
  age: number;
  gender: 'male' | 'female';
  zones: HeartRateZone[];
};

export type MuscleHighlight = {
  primary: MuscleId[];
  secondary: MuscleId[];
};
