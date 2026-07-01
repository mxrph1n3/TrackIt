import { FAT_LOSS_TRACK } from './fatLoss';
import { MAINTENANCE_TRACK } from './maintenance';
import { MASS_GAIN_TRACK } from './massGain';
import {
  getDefaultDayIndex,
  getProgramDay,
  getWorkoutTrack,
  getWorkoutTracks,
  listDaysForWeek,
} from '../../lib/catalog/workoutCatalogService';
import type { WorkoutTrack } from '../../types/workout';

export { MAINTENANCE_TRACK, FAT_LOSS_TRACK, MASS_GAIN_TRACK };

/** @deprecated Use getWorkoutTracks() — returns live DB catalog when available. */
export const WORKOUT_TRACKS: WorkoutTrack[] = [MAINTENANCE_TRACK, FAT_LOSS_TRACK, MASS_GAIN_TRACK];

export { getWorkoutTrack, getProgramDay, listDaysForWeek, getDefaultDayIndex, getWorkoutTracks };
