import { FAT_LOSS_TRACK } from '../../constants/workoutPrograms/fatLoss';
import { MAINTENANCE_TRACK } from '../../constants/workoutPrograms/maintenance';
import { MASS_GAIN_TRACK } from '../../constants/workoutPrograms/massGain';
import { resolveMusclesForExercise } from '../health/muscleMap';
import type {
  MuscleId,
  ProgramDay,
  ProgramExerciseTemplate,
  WorkoutTrack,
  WorkoutTrackId,
} from '../../types/workout';
import { isSupabaseConfigured, supabase } from '../supabase';

const FALLBACK_WORKOUT_TRACKS: WorkoutTrack[] = [
  MAINTENANCE_TRACK,
  FAT_LOSS_TRACK,
  MASS_GAIN_TRACK,
];

function getFallbackWorkoutTrack(id: WorkoutTrackId): WorkoutTrack {
  const track = FALLBACK_WORKOUT_TRACKS.find((entry) => entry.id === id);
  if (!track) {
    throw new Error(`Unknown workout track: ${id}`);
  }
  return track;
}

function getFallbackProgramDay(
  trackId: WorkoutTrackId,
  weekNumber: number,
  dayNumber: number,
): ProgramDay | undefined {
  return getFallbackWorkoutTrack(trackId).days.find(
    (entry) => entry.weekNumber === weekNumber && entry.dayNumber === dayNumber,
  );
}

function listFallbackDaysForWeek(trackId: WorkoutTrackId, weekNumber: number): ProgramDay[] {
  return getFallbackWorkoutTrack(trackId).days.filter((entry) => entry.weekNumber === weekNumber);
}

function getFallbackDefaultDayIndex(trackId: WorkoutTrackId, weekNumber: number): number {
  const days = listFallbackDaysForWeek(trackId, weekNumber);
  if (days.length === 0) {
    return 0;
  }
  const dayOfWeek = new Date().getDay();
  return (dayOfWeek - 1 + days.length) % days.length;
}

type DbTrackRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_weeks: number;
};

type DbDayRow = {
  id: string;
  track_id: string;
  week_number: number;
  day_number: number;
  focus_name: string;
  notes: string | null;
};

type DbExerciseRow = {
  day_id: string;
  exercise_name: string;
  sets_count: number;
  reps_target: string;
  intensity_percentage: number | null;
  rest_seconds: number | null;
  is_cardio: boolean | null;
  cardio_duration_minutes: number | null;
  primary_muscles: string[] | null;
  secondary_muscles: string[] | null;
  sort_order: number;
};

let workoutTracks: WorkoutTrack[] = FALLBACK_WORKOUT_TRACKS;
let isLive = false;
let hydrating: Promise<void> | null = null;

function asMuscleIds(values: string[] | null | undefined, fallback: MuscleId[]): MuscleId[] {
  if (!values?.length) {
    return fallback;
  }
  return values as MuscleId[];
}

function mapExercise(row: DbExerciseRow): ProgramExerciseTemplate {
  const muscles = resolveMusclesForExercise(row.exercise_name);
  const isCardio = row.is_cardio ?? false;

  return {
    name: row.exercise_name,
    setsCount: row.sets_count,
    repsTarget: row.reps_target,
    intensityPercentage: row.intensity_percentage ?? 70,
    restSeconds: row.rest_seconds ?? (isCardio ? 0 : 90),
    isCardio,
    cardioDurationMinutes: row.cardio_duration_minutes ?? 0,
    primaryMuscles: asMuscleIds(row.primary_muscles, muscles.primary),
    secondaryMuscles: asMuscleIds(row.secondary_muscles, muscles.secondary),
  };
}

function slugToTrackId(slug: string): WorkoutTrackId {
  if (slug === 'maintenance' || slug === 'fat_loss' || slug === 'mass_gain') {
    return slug;
  }
  throw new Error(`Unknown workout track slug: ${slug}`);
}

function mapTrack(
  track: DbTrackRow,
  days: DbDayRow[],
  exercises: DbExerciseRow[],
): WorkoutTrack {
  const trackDays = days
    .filter((day) => day.track_id === track.id)
    .sort((left, right) => {
      if (left.week_number !== right.week_number) {
        return left.week_number - right.week_number;
      }
      return left.day_number - right.day_number;
    })
    .map((day): ProgramDay => {
      const dayExercises = exercises
        .filter((exercise) => exercise.day_id === day.id)
        .sort((left, right) => left.sort_order - right.sort_order)
        .map(mapExercise);

      return {
        weekNumber: day.week_number,
        dayNumber: day.day_number,
        focusName: day.focus_name,
        notes: day.notes ? [day.notes] : undefined,
        exercises: dayExercises,
      };
    });

  return {
    id: slugToTrackId(track.slug),
    slug: track.slug,
    title: track.title,
    description: track.description ?? '',
    durationWeeks: track.duration_weeks,
    days: trackDays,
  };
}

export async function hydrateWorkoutCatalog(): Promise<void> {
  if (hydrating) {
    return hydrating;
  }

  hydrating = (async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      const [tracksResult, daysResult, exercisesResult] = await Promise.all([
        supabase.from('workout_tracks').select('id, slug, title, description, duration_weeks').order('slug'),
        supabase.from('workout_days').select('id, track_id, week_number, day_number, focus_name, notes'),
        supabase
          .from('workout_exercises')
          .select(
            'day_id, exercise_name, sets_count, reps_target, intensity_percentage, rest_seconds, is_cardio, cardio_duration_minutes, primary_muscles, secondary_muscles, sort_order',
          )
          .order('sort_order'),
      ]);

      if (tracksResult.error) {
        console.warn('[WorkoutCatalog] tracks query failed:', tracksResult.error.message);
        return;
      }

      const trackRows = (tracksResult.data ?? []) as DbTrackRow[];
      if (trackRows.length === 0) {
        return;
      }

      const dayRows = (daysResult.data ?? []) as DbDayRow[];
      const exerciseRows = (exercisesResult.data ?? []) as DbExerciseRow[];
      const mapped = trackRows.map((track) => mapTrack(track, dayRows, exerciseRows));

      workoutTracks = mapped;
      isLive = true;
    } catch (error) {
      console.warn('[WorkoutCatalog] hydrate failed, using constants:', error);
    } finally {
      hydrating = null;
    }
  })();

  return hydrating;
}

export function getWorkoutTracks(): WorkoutTrack[] {
  return workoutTracks.length > 0 ? workoutTracks : FALLBACK_WORKOUT_TRACKS;
}

export function getWorkoutTrack(id: WorkoutTrackId): WorkoutTrack {
  const tracks = workoutTracks.length > 0 ? workoutTracks : FALLBACK_WORKOUT_TRACKS;
  const track = tracks.find((entry) => entry.id === id);
  if (!track) {
    return getFallbackWorkoutTrack(id);
  }
  return track;
}

export function getProgramDay(
  trackId: WorkoutTrackId,
  weekNumber: number,
  dayNumber: number,
): ProgramDay | undefined {
  return getWorkoutTrack(trackId).days.find(
    (entry) => entry.weekNumber === weekNumber && entry.dayNumber === dayNumber,
  ) ?? getFallbackProgramDay(trackId, weekNumber, dayNumber);
}

export function listDaysForWeek(trackId: WorkoutTrackId, weekNumber: number): ProgramDay[] {
  const days = getWorkoutTrack(trackId).days.filter((entry) => entry.weekNumber === weekNumber);
  if (days.length > 0) {
    return days;
  }
  return listFallbackDaysForWeek(trackId, weekNumber);
}

export function getDefaultDayIndex(trackId: WorkoutTrackId, weekNumber: number): number {
  const days = listDaysForWeek(trackId, weekNumber);
  if (days.length === 0) {
    return getFallbackDefaultDayIndex(trackId, weekNumber);
  }
  const dayOfWeek = new Date().getDay();
  return (dayOfWeek - 1 + days.length) % days.length;
}

export function isWorkoutCatalogLive(): boolean {
  return isLive;
}
