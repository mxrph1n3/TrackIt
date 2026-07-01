import type { WorkoutTrackId } from '../types/workout';

/** Free users can create up to this many custom workout programs. */
export const FREE_MAX_CUSTOM_PROGRAMS = 2;

/** Free users can save up to this many custom exercises. */
export const FREE_MAX_CUSTOM_EXERCISES = 10;

/** Only built-in program available on Free. */
export const FREE_BUILTIN_PROGRAM_ID: WorkoutTrackId = 'maintenance';

/** Built-in programs that require TrackIt Pro. */
export const PRO_BUILTIN_PROGRAM_IDS: WorkoutTrackId[] = ['fat_loss', 'mass_gain'];

/** Analytics history window for Free users (days). */
export const FREE_ANALYTICS_DAYS = 7;

/** Habit heatmap weeks shown on Free. */
export const FREE_ANALYTICS_HEATMAP_WEEKS = 1;

/** Habit heatmap weeks shown on Pro. */
export const PRO_ANALYTICS_HEATMAP_WEEKS = 4;

export function isProBuiltinProgram(trackId: WorkoutTrackId): boolean {
  return PRO_BUILTIN_PROGRAM_IDS.includes(trackId);
}

export function isFreeBuiltinProgram(trackId: WorkoutTrackId): boolean {
  return trackId === FREE_BUILTIN_PROGRAM_ID;
}
