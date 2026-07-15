/**
 * Creates a demo/review account and fills it with ~3 weeks of realistic data
 * so App Store screenshots show a living app.
 *
 * Usage: node scripts/seed-demo-account.js [email] [password]
 * Requires EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvFile();

const EMAIL = process.argv[2] || 'demo.trackit.review@gmail.com';
const PASSWORD = process.argv[3] || 'TrackIt2026!';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anon);

const DAY_MS = 86400000;
function dayKey(offset) {
  return new Date(Date.now() - offset * DAY_MS).toISOString().slice(0, 10);
}
function tsAt(offsetDays, hour, minute = 0) {
  const d = new Date(Date.now() - offsetDays * DAY_MS);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

async function ensureSession() {
  const signIn = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (signIn.data.session) {
    console.log('Signed in as existing demo user.');
    return signIn.data.session;
  }
  if (signIn.error) console.warn(`sign-in: ${signIn.error.message} (status ${signIn.error.status})`);
  const signUp = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: { data: { username: 'alex_orbit' } },
  });
  if (signUp.error) {
    console.error(`sign-up failed: ${signUp.error.message} (status ${signUp.error.status}, code ${signUp.error.code})`);
    throw signUp.error;
  }
  if (!signUp.data.session) {
    throw new Error(
      'Sign-up succeeded but no session returned — email confirmation is enabled. ' +
        'Disable it in Supabase Auth settings or confirm the email, then re-run.',
    );
  }
  console.log('Created demo user.');
  return signUp.data.session;
}

async function insert(table, rows, opts = {}) {
  const query = opts.upsert
    ? supabase.from(table).upsert(rows, { onConflict: opts.upsert, ignoreDuplicates: true })
    : supabase.from(table).insert(rows);
  const { error } = await query;
  if (error) console.warn(`[${table}] ${error.message}`);
  else console.log(`[${table}] +${rows.length}`);
}

async function main() {
  const session = await ensureSession();
  const uid = session.user.id;

  // Profile: level 12 (tier C), solid XP.
  {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: uid,
        username: 'alex_orbit',
        level: 12,
        xp: 8420,
        days_active: 21,
        focus_hours: 46.5,
        habits_count: 5,
      },
      { onConflict: 'id' },
    );
    if (error) console.warn(`[profiles] ${error.message}`);
    else console.log('[profiles] upserted');
  }

  // Tasks: today's plan mid-day (some done), plus history for streaks/analytics.
  const todays = [
    { title: 'Morning run 5K', time: '07:00', completed: true },
    { title: 'Deep work: product roadmap', time: '09:30', completed: true },
    { title: 'Team standup', time: '11:00', completed: true },
    { title: 'Prep investor deck', time: '14:00', completed: false },
    { title: 'Grocery run', time: '18:00', completed: false },
    { title: 'Read 20 pages', time: '21:30', completed: false },
  ];
  await insert(
    'tasks',
    todays.map((t) => ({
      user_id: uid,
      title: t.title,
      is_today: true,
      scheduled_time: t.time,
      completed: t.completed,
      due_date: dayKey(0),
      created_at: tsAt(0, 6, 45),
    })),
  );
  const historyTitles = [
    'Weekly review', 'Inbox zero', 'Stretching', 'Call parents', 'Write journal',
    'Meal prep', 'Budget check-in', 'Side project hour', 'Plan tomorrow', 'Clean desk',
  ];
  const history = [];
  for (let d = 1; d <= 20; d += 1) {
    const count = 3 + ((d * 7) % 3);
    for (let k = 0; k < count; k += 1) {
      history.push({
        user_id: uid,
        title: historyTitles[(d + k * 3) % historyTitles.length],
        is_today: false,
        scheduled_time: `${String(8 + ((k * 4) % 12)).padStart(2, '0')}:00`,
        completed: (d + k) % 5 !== 0,
        due_date: dayKey(d),
        created_at: tsAt(d, 8),
      });
    }
  }
  await insert('tasks', history);

  // Habits with long streaks.
  const habitDefs = [
    'Drink 2L of water',
    'Morning workout',
    'Read 20 pages',
    'No sugar',
    'Sleep by 23:00',
  ];
  const { data: habitRows, error: habitErr } = await supabase
    .from('habits')
    .insert(habitDefs.map((title) => ({ user_id: uid, title, is_active: true })))
    .select('id, title');
  if (habitErr) console.warn(`[habits] ${habitErr.message}`);
  else {
    console.log(`[habits] +${habitRows.length}`);
    const logs = [];
    habitRows.forEach((habit, idx) => {
      for (let d = 0; d <= 20; d += 1) {
        // High but imperfect completion; today: first 3 habits done.
        const doneToday = d === 0 ? idx < 3 : (d + idx) % 7 !== 3;
        if (doneToday) {
          logs.push({
            habit_id: habit.id,
            user_id: uid,
            logged_on: dayKey(d),
            completed: true,
          });
        }
      }
    });
    await insert('habit_logs', logs, { upsert: 'habit_id,logged_on' });
  }

  // Workouts: completed sessions ~4x/week, today's done.
  const workoutDays = [0, 2, 3, 5, 7, 9, 10, 12, 14, 16, 17, 19];
  await insert(
    'workout_sessions',
    workoutDays.map((d) => ({
      user_id: uid,
      session_date: dayKey(d),
      completed: true,
      completed_at: tsAt(d, 8, 10),
    })),
    { upsert: 'user_id,session_date' },
  );

  // Nutrition: today partially eaten, history near target.
  await insert(
    'daily_nutrition_logs',
    [
      { user_id: uid, log_date: dayKey(0), calories_consumed: 1240, calorie_target: 2200 },
      ...Array.from({ length: 14 }, (_, i) => ({
        user_id: uid,
        log_date: dayKey(i + 1),
        calories_consumed: 1850 + ((i * 137) % 400),
        calorie_target: 2200,
      })),
    ],
    { upsert: 'user_id,log_date' },
  );

  // Water: 5 glasses today + history.
  const water = [
    ...[8, 10, 12, 14, 16].map((h) => ({ user_id: uid, amount_ml: 300, logged_at: tsAt(0, h) })),
  ];
  for (let d = 1; d <= 14; d += 1) {
    for (let k = 0; k < 6; k += 1) {
      water.push({ user_id: uid, amount_ml: 300, logged_at: tsAt(d, 8 + k * 2) });
    }
  }
  await insert('water_logs', water);

  // Weight trend: slow cut 78.4 -> 76.9.
  await insert(
    'weight_logs',
    Array.from({ length: 15 }, (_, i) => ({
      user_id: uid,
      weight_kg: (76.9 + i * 0.1).toFixed(1),
      logged_on: dayKey(i),
      logged_at: tsAt(i, 7, 30),
    })),
    { upsert: 'user_id,logged_on' },
  );

  // Finance: account, salary + expenses, budgets, subscriptions, goal.
  const { data: account } = await supabase
    .from('finance_accounts')
    .insert({ user_id: uid, name: 'Main card', icon: '💳', color: '#8B5CF6', currency: 'USD', is_default: true })
    .select('id')
    .single();
  const accountId = account ? account.id : null;
  console.log('[finance_accounts] +1');
  const tx = [
    { type: 'income', amount: 4200, category: 'Salary', label: 'Monthly salary', d: 6, h: 10 },
    { type: 'income', amount: 650, category: 'Freelance', label: 'Design gig', d: 3, h: 15 },
    { type: 'expense', amount: 42.5, category: 'Groceries', label: 'Whole Foods', d: 0, h: 12 },
    { type: 'expense', amount: 12.99, category: 'Transport', label: 'Uber', d: 0, h: 9 },
    { type: 'expense', amount: 68, category: 'Groceries', label: 'Weekly groceries', d: 1, h: 18 },
    { type: 'expense', amount: 35, category: 'Dining', label: 'Lunch with team', d: 2, h: 13 },
    { type: 'expense', amount: 120, category: 'Health', label: 'Gym membership', d: 4, h: 8 },
    { type: 'expense', amount: 89.99, category: 'Shopping', label: 'Running shoes', d: 5, h: 17 },
    { type: 'expense', amount: 54.2, category: 'Utilities', label: 'Electricity', d: 7, h: 11 },
    { type: 'expense', amount: 24, category: 'Entertainment', label: 'Cinema', d: 8, h: 20 },
    { type: 'expense', amount: 76.4, category: 'Groceries', label: 'Groceries', d: 9, h: 18 },
    { type: 'expense', amount: 15.5, category: 'Transport', label: 'Metro card', d: 10, h: 8 },
  ];
  await insert(
    'transactions',
    tx.map((t) => ({
      user_id: uid,
      type: t.type,
      amount: t.amount,
      category: t.category,
      label: t.label,
      account_id: accountId,
      occurred_at: tsAt(t.d, t.h),
      created_at: tsAt(t.d, t.h),
    })),
  );
  await insert('finance_goals', [
    { user_id: uid, name: 'MacBook Pro', target_amount: 2500, saved_amount: 1750, icon: '💻', color: '#8B5CF6' },
    { user_id: uid, name: 'Trip to Japan', target_amount: 4000, saved_amount: 1200, icon: '✈️', color: '#6366F1' },
  ]);
  await insert('finance_subscriptions', [
    { user_id: uid, name: 'Spotify', amount: 10.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: dayKey(-12), account_id: accountId },
    { user_id: uid, name: 'iCloud+', amount: 2.99, currency: 'USD', billing_cycle: 'monthly', next_billing_date: dayKey(-20), account_id: accountId },
    { user_id: uid, name: 'Netflix', amount: 15.49, currency: 'USD', billing_cycle: 'monthly', next_billing_date: dayKey(-5), account_id: accountId },
  ]);

  // Focus sessions: today's 3 pomodoros + history.
  const focus = [];
  [9, 10, 15].forEach((h) => focus.push({ user_id: uid, session_type: 'focus', duration_seconds: 1500, completed_at: tsAt(0, h, 25) }));
  for (let d = 1; d <= 14; d += 1) {
    const n = 2 + (d % 3);
    for (let k = 0; k < n; k += 1) {
      focus.push({ user_id: uid, session_type: 'focus', duration_seconds: 1500, completed_at: tsAt(d, 9 + k * 2, 25) });
    }
  }
  await insert('focus_sessions', focus);

  // Journal + mood.
  await insert(
    'journal_entries',
    [
      { user_id: uid, day_key: dayKey(0), body: 'Great morning run — legs felt strong. Roadmap session went deep; cut scope on v2 and it finally feels shippable.' },
      { user_id: uid, day_key: dayKey(1), body: 'Solid day. Kept the no-sugar streak alive and closed all planned tasks before 19:00.' },
      { user_id: uid, day_key: dayKey(2), body: 'Long workout, heavy squats PR 110kg. Need to sleep earlier tonight.' },
    ],
    { upsert: 'user_id,day_key' },
  );
  await insert(
    'mood_logs',
    Array.from({ length: 10 }, (_, i) => ({
      user_id: uid,
      mood_score: [5, 4, 5, 4, 3, 4, 5, 4, 4, 5][i],
      logged_on: dayKey(i),
      logged_at: tsAt(i, 21),
    })),
  );

  console.log('\nDemo account ready:');
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
