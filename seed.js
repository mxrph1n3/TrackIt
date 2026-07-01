/**
 * TrackIt production database seeder
 *
 * Populates Supabase catalog tables from food.md (Level 2) and training.md.
 *
 * Usage:
 *   npm run seed
 *
 * Required env (.env):
 *   EXPO_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (recommended — bypasses RLS for catalog writes)
 *
 * Falls back to EXPO_PUBLIC_SUPABASE_ANON_KEY if service role is unavailable.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const { INGREDIENTS, MEALS } = require('./scripts/seed-data');
const { WORKOUT_TRACKS_SEED } = require('./scripts/workout-tracks-seed');

const BATCH_SIZE = 50;

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function upsertBatches(supabase, table, rows, onConflict, label) {
  if (rows.length === 0) {
    console.log(`[seed] Skipped ${label} — no rows.`);
    return 0;
  }

  let written = 0;
  const batches = chunkArray(rows, BATCH_SIZE);

  for (const [index, batch] of batches.entries()) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) {
      throw new Error(`${label} batch ${index + 1}/${batches.length} failed: ${error.message}`);
    }
    written += batch.length;
    console.log(`[seed] ${label}: wrote batch ${index + 1}/${batches.length} (${batch.length} rows)`);
  }

  console.log(`[seed] ✓ ${label} complete — ${written} rows upserted into "${table}".`);
  return written;
}

async function seedMealsGraph(supabase) {
  const mealRows = MEALS.map(({ ingredients, ...meal }) => meal);
  const mealIds = mealRows.map((meal) => meal.meal_id);

  const { error: junctionDeleteError } = await supabase
    .from('meal_ingredients')
    .delete()
    .in('meal_id', mealIds);

  if (junctionDeleteError) {
    throw new Error(`Failed to clear meal_ingredients: ${junctionDeleteError.message}`);
  }

  await upsertBatches(supabase, 'meals', mealRows, 'meal_id', 'Meals');

  const junctionRows = MEALS.flatMap((meal) =>
    meal.ingredients.map((ingredient) => ({
      meal_id: meal.meal_id,
      ingredient_id: ingredient.id,
      grams: ingredient.grams,
    })),
  );

  await upsertBatches(
    supabase,
    'meal_ingredients',
    junctionRows,
    'meal_id,ingredient_id',
    'Meal ingredients',
  );
}

async function seedWorkoutTracks(supabase) {
  let trackCount = 0;
  let dayCount = 0;
  let exerciseCount = 0;

  for (const track of WORKOUT_TRACKS_SEED) {
    const { data: trackRow, error: trackError } = await supabase
      .from('workout_tracks')
      .upsert(
        {
          slug: track.slug,
          title: track.title,
          description: track.description,
          duration_weeks: track.duration_weeks,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();

    if (trackError) {
      throw new Error(`Failed to upsert workout track "${track.slug}": ${trackError.message}`);
    }

    trackCount += 1;

    const { data: existingDays, error: daysReadError } = await supabase
      .from('workout_days')
      .select('id')
      .eq('track_id', trackRow.id);

    if (daysReadError) {
      throw new Error(`Failed to read workout days for "${track.slug}": ${daysReadError.message}`);
    }

    const dayIds = (existingDays ?? []).map((day) => day.id);
    if (dayIds.length > 0) {
      const { error: exerciseDeleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .in('day_id', dayIds);

      if (exerciseDeleteError) {
        throw new Error(`Failed to clear workout exercises for "${track.slug}": ${exerciseDeleteError.message}`);
      }

      const { error: dayDeleteError } = await supabase
        .from('workout_days')
        .delete()
        .eq('track_id', trackRow.id);

      if (dayDeleteError) {
        throw new Error(`Failed to clear workout days for "${track.slug}": ${dayDeleteError.message}`);
      }
    }

    for (const day of track.days) {
      const { data: dayRow, error: dayError } = await supabase
        .from('workout_days')
        .insert({
          track_id: trackRow.id,
          week_number: day.week_number,
          day_number: day.day_number,
          focus_name: day.focus_name,
          notes: day.notes,
        })
        .select('id')
        .single();

      if (dayError) {
        throw new Error(`Failed to insert day "${day.focus_name}" for ${track.slug}: ${dayError.message}`);
      }

      dayCount += 1;

      if (day.exercises.length === 0) {
        continue;
      }

      const exerciseRows = day.exercises.map((exercise, index) => ({
        day_id: dayRow.id,
        exercise_name: exercise.exercise_name,
        sets_count: exercise.sets_count,
        reps_target: exercise.reps_target,
        intensity_percentage: exercise.intensity_percentage,
        rest_seconds: exercise.rest_seconds,
        is_cardio: exercise.is_cardio,
        cardio_duration_minutes: exercise.cardio_duration_minutes,
        primary_muscles: exercise.primary_muscles,
        secondary_muscles: exercise.secondary_muscles,
        sort_order: index,
      }));

      const { error: exerciseError } = await supabase.from('workout_exercises').insert(exerciseRows);

      if (exerciseError) {
        throw new Error(
          `Failed to insert exercises for "${day.focus_name}" (${track.slug}): ${exerciseError.message}`,
        );
      }

      exerciseCount += exerciseRows.length;
    }

    console.log(`[seed] ✓ Workout track "${track.title}" days and exercises inserted.`);
  }

  console.log(
    `[seed] ✓ Workout tracks complete — ${trackCount} tracks, ${dayCount} days, ${exerciseCount} exercises.`,
  );
}

async function main() {
  loadEnvFile();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !apiKey) {
    throw new Error(
      'Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.',
    );
  }

  if (!serviceRoleKey) {
    console.warn(
      '[seed] Warning: SUPABASE_SERVICE_ROLE_KEY not found. Falling back to anon key — seed may fail if RLS blocks writes.',
    );
  }

  const supabase = createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('[seed] Starting TrackIt catalog seed…');
  console.log(`[seed] Target: ${supabaseUrl}`);

  await upsertBatches(supabase, 'ingredients', INGREDIENTS, 'id', 'Ingredients');
  await seedMealsGraph(supabase);
  await seedWorkoutTracks(supabase);

  console.log('[seed] All catalog tables seeded successfully.');
}

main().catch((error) => {
  console.error('[seed] Failed:', error.message);
  process.exit(1);
});
