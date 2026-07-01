import type { WorkoutTrack } from '../../types/workout';
import { day, ex, MAINTENANCE_NOTES, warmup } from './builder';

export const MAINTENANCE_TRACK: WorkoutTrack = {
  id: 'maintenance',
  slug: 'maintenance',
  title: 'Full Body Beginner',
  description: 'Balanced beginner-friendly cycle — included with TrackIt Free.',
  durationWeeks: 2,
  days: [
    day(1, 1, 'Warm-up + Upper/Core', [
      warmup(),
      ex('Thrusters', 3, '15'),
      ex('Push-ups with Dumbbell Row', 3, '12'),
      ex('Crunches', 3, '15'),
      ex('Pull-ups', 3, '12'),
      ex('Dumbbell Curls', 3, '10'),
      ex('Overhead Extension (Triceps)', 3, '15'),
    ]),
    day(1, 2, 'Press + Pull + Legs', [
      ex('Dumbbell Bench Press', 3, '12'),
      ex('Lat Pulldown', 3, '15'),
      ex('Lunges', 3, '20'),
      ex('Plank', 3, '1 min'),
      ex('Dumbbell Upright Row', 3, '12'),
      ex('Calf Raise', 3, '20'),
    ]),
    day(1, 3, 'Legs + Back + Arms', [
      ex('Squats', 3, '8-12'),
      ex('Two-Dumbbell Row', 3, '8-12'),
      ex('Dips', 3, '8-12'),
      ex('Hammer Curls', 3, '12'),
      ex('Rope Pushdown (Triceps)', 3, '15'),
      ex('Hyperextension', 3, '15'),
    ]),
    day(2, 1, 'Press + Deadlift + Core', [
      ex('Barbell Bench Press', 3, '12'),
      ex('Deadlift', 3, '10'),
      ex('Goblet Squat', 3, '12'),
      ex('Mountain Climbers (Abs)', 3, '20'),
      ex('Cable Biceps Curl', 3, '10'),
      ex('Rope Pushdown (Triceps)', 3, '15'),
    ]),
    day(2, 2, 'Chest + Back + Legs', [
      ex('Narrow-Grip Medicine Ball Push-ups', 3, '10'),
      ex('Seated Row', 3, '12'),
      ex('Romanian Deadlift', 3, '10'),
      ex('Seated Dumbbell Press', 3, '12'),
      ex('Hammer Curls', 3, '12'),
      ex('Hyperextension', 3, '15'),
    ]),
    day(2, 3, 'Full Body + Core', [
      ex('Smith Machine Bench Press', 3, '12'),
      ex('Barbell Row', 3, '10'),
      ex('Lunges', 3, '15'),
      ex('Flyes', 3, '15'),
      ex('Seated Overhead Rope Extension', 3, '12'),
      ex('Plank', 3, '1 min'),
    ], MAINTENANCE_NOTES),
  ],
};
