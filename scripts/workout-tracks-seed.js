/**
 * Workout track seed data — mirrors src/constants/workoutPrograms/* for DB seeding.
 */

function ex(name, sets, reps, opts = {}) {
  return {
    exercise_name: name,
    sets_count: sets,
    reps_target: reps,
    intensity_percentage: opts.intensity_percentage ?? 70,
    rest_seconds: opts.is_cardio ? 0 : (opts.rest_seconds ?? 90),
    is_cardio: opts.is_cardio ?? false,
    cardio_duration_minutes: opts.cardio_duration_minutes ?? 0,
    primary_muscles: opts.primary_muscles ?? [],
    secondary_muscles: opts.secondary_muscles ?? [],
  };
}

function warmup(minutes = 12) {
  return ex('Full Body Warm-up', 1, `${minutes} min`, {
    is_cardio: true,
    cardio_duration_minutes: minutes,
    primary_muscles: ['core'],
    secondary_muscles: ['quadriceps'],
  });
}

function cardioBlock(minutes, label) {
  return ex(`Cardio — ${label}`, 1, `${minutes} min`, {
    is_cardio: true,
    cardio_duration_minutes: minutes,
    primary_muscles: ['core'],
    secondary_muscles: ['quadriceps', 'calves'],
  });
}

function day(weekNumber, dayNumber, focusName, exercises, notes) {
  return {
    week_number: weekNumber,
    day_number: dayNumber,
    focus_name: focusName,
    notes: notes ? notes.join('\n') : null,
    exercises,
  };
}

const MAINTENANCE_NOTES = [
  'Use weight around 70% of your one-rep max.',
  'Rest between sets: 90–120 seconds.',
  'If you experience significant muscle soreness, postpone the workout and allow muscles to recover.',
];

const WORKOUT_TRACKS_SEED = [
  {
    slug: 'maintenance',
    title: 'Maintenance',
    description: 'Balanced 2-week strength and endurance cycle at 70% 1RM.',
    duration_weeks: 2,
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
  },
  {
    slug: 'fat_loss',
    title: 'Fat Loss',
    description: 'Cardio blocks in zones 1–2 + strength supersets for fat burning.',
    duration_weeks: 2,
    days: [
      day(1, 1, 'Cardio + Full Body A', [
        warmup(12),
        cardioBlock(15, 'Treadmill: incline 8, speed 3.5–4'),
        ex('Hack Squat / Smith Squat', 3, '10'),
        ex('Bench Press', 3, '12'),
        ex('Calf Raise', 3, '12-15'),
        ex('Seated Row', 3, '12'),
        ex('Glute Bridge', 3, '12'),
        ex('Lateral Raises', 3, '12-15'),
        ex('Ab Crunches', 3, '15-20'),
      ]),
      day(1, 2, 'Cardio + Full Body B', [
        cardioBlock(15, 'Elliptical, resistance 6'),
        ex('Bulgarian Split Squats', 3, '10'),
        ex('Seated Dumbbell Press', 3, '12'),
        ex('Stiff-Leg Deadlift', 3, '10'),
        ex('Lat Pulldown', 3, '12'),
        ex('Leg Curl', 3, '12-15'),
        ex('Cable Pullover', 3, '15'),
        ex('Leg Extension', 3, '12-15'),
      ]),
      day(1, 3, 'Cardio + Arms + Abs', [
        cardioBlock(15, 'Stationary Bike'),
        ex('Standing Biceps Curl', 3, '12'),
        ex('Cable Triceps Extension', 3, '15'),
        ex('Crunches (Machine)', 3, '20'),
        cardioBlock(15, 'Treadmill: incline 8, speed 4'),
      ]),
      day(1, 4, 'Cardio + Pull + Back', [
        cardioBlock(10, 'Treadmill: incline 8, speed 4'),
        ex('Deadlift', 3, '10'),
        ex('Lat Pulldown to Chest', 3, '12'),
        ex('Seated Cable Row', 3, '10'),
        ex('Pullover (Machine)', 3, '12'),
        ex('Assisted Pull-ups', 3, '12'),
        cardioBlock(12, 'Rowing Machine'),
      ]),
      day(2, 1, 'Long Cardio + Upper', [
        cardioBlock(35, 'Stationary Bike'),
        ex('Seated Dumbbell Press', 3, '12'),
        ex('Assisted Dips', 3, '12'),
        ex('Dumbbell Press', 3, '12'),
        ex('Flyes', 3, '12'),
        ex('Biceps Curls', 3, '10'),
        ex('Rope Pushdown (Triceps)', 3, '12'),
      ]),
      day(2, 2, 'Cardio + Core', [
        cardioBlock(55, 'Your choice (zone 1–2)'),
        ex('Hyperextension', 3, '12'),
        ex('Ab Crunches', 3, '20'),
        ex('Plank', 3, '30-40 sec'),
      ]),
      day(2, 3, 'Cardio + Full Body C', [
        cardioBlock(15, 'Treadmill: incline 8, speed 4.5'),
        ex('Smith Machine Bench Press', 3, '12'),
        ex('Barbell Row', 3, '10'),
        ex('Lunges', 3, '15'),
        ex('Flyes', 3, '15'),
        ex('Seated Overhead Rope Extension', 3, '12'),
        ex('Plank', 3, '1 min'),
        cardioBlock(15, 'Rowing'),
      ], [
        'Heart rate during warm-up and cool-down — zones 1 and 2.',
        'Max HR formula: 220 − age (M) / 226 − age (F).',
      ]),
    ],
  },
  {
    slug: 'mass_gain',
    title: 'Lean Mass Gain',
    description: '8-day split: upper / lower + shoulders with 4×8–12 volume and drop sets.',
    duration_weeks: 1,
    days: [
      day(1, 1, 'Day 1 — Upper', [
        ex('Dumbbell Press', 4, '8-10'),
        ex('Pull-ups', 4, '10-12'),
        ex('Pec Deck', 4, '12'),
        ex('Barbell Row', 4, '10-12'),
        ex('Hammer Curls', 4, '12-15'),
        ex('Overhead Rope Extension (Low Pulley)', 4, '12'),
      ]),
      day(1, 2, 'Day 2 — Legs + Shoulders', [
        ex('Smith Machine Squat', 4, '12'),
        ex('Leg Extensions', 4, '12'),
        ex('Leg Curls', 4, '12'),
        ex('Hyperextension', 4, '20'),
        ex('Leg Press', 4, '12'),
        ex('Dumbbell Press', 4, '12'),
        ex('Cable Flyes (Low Pulley)', 4, '12'),
        ex('Rear Delt Flyes (Seated)', 4, '12'),
        ex('Barbell Upright Row', 4, '12'),
      ]),
      day(1, 3, 'Day 3 — Upper', [
        ex('Incline Smith Machine Press', 4, '12'),
        ex('Seated Cable Row', 4, '12'),
        ex('Handle Push-ups', 4, '15-20'),
        ex('Lat Pulldown', 4, '12'),
        ex('EZ-Bar Curl', 4, '12'),
        ex('Close-Grip Bench Press', 4, '12-15'),
      ]),
      day(1, 4, 'Day 4 — Lower + Shoulders', [
        ex('Leg Press', 4, '12'),
        ex('Walking Lunges', 4, '10/leg'),
        ex('Standing Calf Raise (Smith)', 4, '12'),
        ex('Lateral Raises (Drop Set 70/50/30%)', 4, '10'),
        ex('Face Pull', 4, '12'),
      ]),
      day(1, 5, 'Day 5 — Upper', [
        ex('Medicine Ball Push-ups', 4, '15-20'),
        ex('One-Arm Dumbbell Row', 4, '12/side'),
        ex('Cable Crossover', 4, '12-15'),
        ex('Hammer Strength Row', 4, '12'),
        ex('Rope Biceps Curl', 4, '12'),
        ex('Triceps Extension (High Pulley)', 4, '12'),
      ]),
      day(1, 6, 'Day 6 — Lower + Shoulders', [
        ex('Platform Lunges (Single Leg)', 4, '12/leg'),
        ex('Leg Extensions', 4, '12'),
        ex('Leg Curls', 4, '12'),
        ex('Deep Goblet Squats', 4, '12'),
        ex('Standing Dumbbell Calf Raise', 4, '12'),
        ex('Cable Upright Row', 4, '12'),
        ex('Incline Rear Delt Flyes (45° Bench)', 4, '12'),
      ]),
      day(1, 7, 'Day 7 — Upper', [
        ex('Barbell Bench Press (70% 1RM)', 4, '12', { intensity_percentage: 70 }),
        ex('Seated Lat Pulldown', 4, '12'),
        ex('Pec Deck', 4, '15-20'),
        ex('Bar Row to Chest', 4, '12'),
        ex('Reverse Pec Deck Row (Back)', 4, '12'),
        ex('Hammer Curls', 4, '12'),
        ex('Incline Dumbbell Triceps Extension (30°)', 4, '12'),
      ]),
      day(1, 8, 'Day 8 — Lower + Shoulders', [
        ex('Smith Machine Lunges', 4, '12/leg'),
        ex('Bulgarian Split Squats', 4, '10/leg'),
        ex('Leg Extensions', 4, '12'),
        ex('Leg Curls', 4, '12'),
        ex('Smith Machine Calf Raise', 4, '12'),
        ex('Dumbbell Press', 4, '12'),
        ex('Cable Flyes (Low Pulley)', 4, '12-15'),
        ex('Face Pull', 4, '12'),
      ]),
    ],
  },
];

module.exports = { WORKOUT_TRACKS_SEED };
