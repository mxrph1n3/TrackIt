import { TRACKIT_DEEP_LINKS } from '../navigation/deepLinkRouter';
import type { NotificationCategory, TrackItNotificationMessage } from './types';

function msg(
  category: NotificationCategory,
  body: string,
  options: Partial<Omit<TrackItNotificationMessage, 'id' | 'category' | 'body'>> = {},
): TrackItNotificationMessage {
  return {
    id: `${category}-${body.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`,
    category,
    body,
    priority: options.priority ?? 'normal',
    time: options.time ?? 'anytime',
    title: options.title ?? 'TrackIt',
    deepLink: options.deepLink,
  };
}

export const NOTIFICATION_LIBRARY: TrackItNotificationMessage[] = [
  // —— Reminder: Tasks ——
  msg('reminder_tasks', 'You still have 3 unfinished tasks today.', { deepLink: TRACKIT_DEEP_LINKS.plannerTasks, time: 'midday' }),
  msg('reminder_tasks', 'Not much time left in the day.', { deepLink: TRACKIT_DEEP_LINKS.planner, time: 'evening' }),
  msg('reminder_tasks', "Don't forget to mark completed items.", { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('reminder_tasks', 'One completed item beats ten planned ones.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('reminder_tasks', 'Take the next step.', { deepLink: TRACKIT_DEEP_LINKS.planner, priority: 'high' }),
  msg('reminder_tasks', 'Even 5 minutes today is better than nothing.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('reminder_tasks', "Come back and close today's list.", { deepLink: TRACKIT_DEEP_LINKS.plannerTasks, time: 'evening' }),
  msg('reminder_tasks', "You're closer to your goal than yesterday.", { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('reminder_tasks', 'You can still make today a success.', { deepLink: TRACKIT_DEEP_LINKS.planner, time: 'night' }),
  msg('reminder_tasks', 'Your progress is waiting for you.', { deepLink: TRACKIT_DEEP_LINKS.planner }),

  // —— Reminder: Workout ——
  msg('reminder_workout', 'Today is workout day.', { deepLink: TRACKIT_DEEP_LINKS.workout, time: 'midday' }),
  msg('reminder_workout', "Your body won't change on its own.", { deepLink: TRACKIT_DEEP_LINKS.workout }),
  msg('reminder_workout', "Don't skip your workout.", { deepLink: TRACKIT_DEEP_LINKS.workoutStart, priority: 'high' }),
  msg('reminder_workout', "Today you're getting stronger.", { deepLink: TRACKIT_DEEP_LINKS.workout }),
  msg('reminder_workout', 'Even a short workout matters.', { deepLink: TRACKIT_DEEP_LINKS.workoutStart }),
  msg('reminder_workout', '30 minutes today will change you in a year.', { deepLink: TRACKIT_DEEP_LINKS.workout }),
  msg('reminder_workout', 'Start your warm-up right now.', { deepLink: TRACKIT_DEEP_LINKS.workoutStart, priority: 'high' }),
  msg('reminder_workout', 'Your next workout brings you closer to your goal.', { deepLink: TRACKIT_DEEP_LINKS.workout }),
  msg('reminder_workout', "Don't break your streak.", { deepLink: TRACKIT_DEEP_LINKS.workout, time: 'midday' }),
  msg('reminder_workout', 'Today is your day.', { deepLink: TRACKIT_DEEP_LINKS.workoutStart }),

  // —— Reminder: Nutrition ——
  msg('reminder_nutrition', 'Time for your next meal.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch, time: 'midday' }),
  msg('reminder_nutrition', "Don't forget to stick to your routine.", { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', "Protein won't eat itself.", { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', 'Eat the way your goal looks.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', 'Choose in favor of your future self.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', "Don't skip a meal.", { deepLink: TRACKIT_DEEP_LINKS.foodSearch, time: 'midday' }),
  msg('reminder_nutrition', 'Every meal matters today.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', 'Log your diet.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', 'Watch what builds your body.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),
  msg('reminder_nutrition', 'Control starts with one meal.', { deepLink: TRACKIT_DEEP_LINKS.foodSearch }),

  // —— Reminder: Finance ——
  msg('reminder_finance', "Log today's expenses.", { deepLink: TRACKIT_DEEP_LINKS.finance, time: 'evening' }),
  msg('reminder_finance', 'Money loves being tracked.', { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', 'Control your habits.', { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', "Don't forget to add new expenses.", { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', 'Every entry makes you richer in knowledge.', { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', 'Financial discipline starts today.', { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', 'Check your budget.', { deepLink: TRACKIT_DEEP_LINKS.finance, time: 'evening' }),
  msg('reminder_finance', 'Any purchases today?', { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', 'Expense control = life control.', { deepLink: TRACKIT_DEEP_LINKS.finance }),
  msg('reminder_finance', 'A few seconds now will save thousands later.', { deepLink: TRACKIT_DEEP_LINKS.finance }),

  // —— Motivation ——
  msg('motivation', "Don't forget why you started.", { time: 'morning' }),
  msg('motivation', "You're capable of much more.", { time: 'morning' }),
  msg('motivation', "Don't waste your potential.", { time: 'morning' }),
  msg('motivation', 'Today either you run the day or the day runs you.', { time: 'morning', priority: 'high' }),
  msg('motivation', "In a year you'll only regret not starting sooner.", { time: 'morning' }),
  msg('motivation', "The future is built by today's decisions.", { time: 'morning' }),
  msg('motivation', 'Small daily actions beat rare heroic feats.', { time: 'morning' }),
  msg('motivation', 'Discipline always beats motivation.', { time: 'morning' }),
  msg('motivation', "Strong people act even when they don't feel like it.", { time: 'morning' }),
  msg('motivation', 'One habit can change your whole life.', { time: 'morning' }),
  msg('motivation', 'Laziness always costs more than effort.', { time: 'morning' }),
  msg('motivation', 'Today is the perfect day to start over.', { time: 'morning' }),
  msg('motivation', 'The best time was yesterday. The next best is right now.', { time: 'morning' }),
  msg('motivation', "Don't wait for inspiration. Create it through action.", { time: 'morning' }),
  msg('motivation', "You've come too far to stop now.", { time: 'morning' }),
  msg('motivation', "The winner isn't the most talented — it's the most consistent.", { time: 'morning' }),
  msg('motivation', "Do today what you'll thank yourself for tomorrow.", { time: 'night' }),
  msg('motivation', 'Every day is an investment in your future self.', { time: 'morning' }),
  msg('motivation', "Don't let one bad day become a bad life.", { time: 'night' }),
  msg('motivation', "Today's choices define your tomorrow.", { time: 'morning' }),

  // —— Hardcore ——
  msg('hardcore', "100 years of life is only about 36,500 days. Don't waste them.", { time: 'morning', priority: 'high' }),
  msg('hardcore', 'While you postpone, someone else is already doing it.', { time: 'morning', priority: 'high' }),
  msg('hardcore', "You're either building your life or watching someone else's.", { time: 'morning' }),
  msg('hardcore', "Time will pass anyway. The question is who you'll become.", { time: 'morning' }),
  msg('hardcore', "Success doesn't like excuses.", { time: 'morning', priority: 'high' }),
  msg('hardcore', 'Every skipped day becomes a habit.', { time: 'morning' }),
  msg('hardcore', 'Your potential is worthless without action.', { time: 'morning' }),
  msg('hardcore', 'No one is coming to save you.', { time: 'morning', priority: 'high' }),
  msg('hardcore', "Today's laziness is tomorrow's regret.", { time: 'night' }),
  msg('hardcore', 'Your dreams need discipline, not hope.', { time: 'morning' }),
  msg('hardcore', "If you quit today, in a year you'll be in the same place.", { time: 'night' }),
  msg('hardcore', 'Every day without action is a vote for mediocrity.', { time: 'morning' }),
  msg('hardcore', 'How many opportunities have already passed you by?', { time: 'morning' }),
  msg('hardcore', "Don't lie to yourself.", { time: 'night', priority: 'high' }),
  msg('hardcore', "Excuses don't change the outcome.", { time: 'morning' }),

  // —— Philosophy ——
  msg('philosophy', '"Lose a day and you lose a part of life." — Marcus Aurelius', { time: 'morning' }),
  msg('philosophy', '"Do what you must." — Marcus Aurelius', { time: 'morning' }),
  msg('philosophy', '"The happiness of your life depends on the quality of your thoughts." — Marcus Aurelius', { time: 'morning' }),
  msg('philosophy', '"While we postpone life, it passes." — Seneca', { time: 'morning' }),
  msg('philosophy', '"It is not because things are difficult that we do not dare; we do not dare, so they are difficult." — Seneca', { time: 'morning' }),
  msg('philosophy', '"Every new day is a new life." — Seneca', { time: 'morning' }),
  msg('philosophy', '"It is not events that shape a person, but their attitude toward them." — Epictetus', { time: 'morning' }),
  msg('philosophy', '"First say to yourself who you want to be." — Epictetus', { time: 'morning' }),
  msg('philosophy', '"It does not matter how slowly you go as long as you do not stop." — Confucius', { time: 'morning' }),
  msg('philosophy', '"He who has a why to live can bear almost any how." — Nietzsche', { time: 'morning' }),
  msg('philosophy', '"We are what we repeatedly do." — Aristotle', { time: 'morning' }),
  msg('philosophy', '"A journey of a thousand miles begins with a single step." — Lao Tzu', { time: 'morning' }),
  msg('philosophy', '"Guard your time — it is the one thing you cannot get back." — Socrates', { time: 'morning' }),
  msg('philosophy', '"Between stimulus and response there is a choice." — Viktor Frankl', { time: 'morning' }),

  // —— TrackIt Original ——
  msg('trackit_original', 'Today only one thing counts — what you did.', { deepLink: TRACKIT_DEEP_LINKS.planner, time: 'morning' }),
  msg('trackit_original', 'Every completed task changes you.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('trackit_original', 'Your streak is still going.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('trackit_original', "Don't let today disappear without a trace.", { deepLink: TRACKIT_DEEP_LINKS.planner, time: 'night' }),
  msg('trackit_original', 'Do at least one thing.', { deepLink: TRACKIT_DEEP_LINKS.plannerTasks, priority: 'high' }),
  msg('trackit_original', 'One checkmark today means one less regret tomorrow.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('trackit_original', 'Every percent of progress matters.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('trackit_original', 'Keep building your system.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('trackit_original', 'Success loves those who show up every day.', { deepLink: TRACKIT_DEEP_LINKS.planner, time: 'morning' }),
  msg('trackit_original', 'The future starts after the Done button.', { deepLink: TRACKIT_DEEP_LINKS.plannerTasks }),

  // —— Streak ——
  msg('streak', "🔥 Already 7 days in a row. Don't stop!", { deepLink: TRACKIT_DEEP_LINKS.planner, priority: 'high' }),
  msg('streak', "You can't lose your streak today.", { deepLink: TRACKIT_DEEP_LINKS.planner, priority: 'high' }),
  msg('streak', 'One more day — and a new record.', { deepLink: TRACKIT_DEEP_LINKS.planner }),
  msg('streak', "You've gone too far to quit.", { deepLink: TRACKIT_DEEP_LINKS.planner, priority: 'high' }),
  msg('streak', 'Streaks motivate; discipline changes lives.', { deepLink: TRACKIT_DEEP_LINKS.planner }),

  // —— Celebration ——
  msg('celebration', 'You completed all tasks for today. Great job.', { time: 'night', priority: 'high' }),
  msg('celebration', 'Today was a productive day.', { time: 'night' }),
  msg('celebration', 'Another step taken.', { time: 'night' }),
  msg('celebration', "You're getting better every day.", { time: 'night' }),
  msg('celebration', 'Keep it up.', { time: 'night' }),

  // —— Comeback ——
  msg('comeback', "We're waiting for you.", { time: 'morning', priority: 'high' }),
  msg('comeback', 'You can still continue.', { time: 'morning' }),
  msg('comeback', "Don't let a few days turn into a month.", { time: 'morning', priority: 'high' }),
  msg('comeback', "It's easier to come back today than tomorrow.", { time: 'morning' }),
  msg('comeback', 'Starting over is progress too.', { time: 'morning' }),
  msg('comeback', 'You already know you can do more.', { time: 'morning', priority: 'high' }),
];

export const LIBRARY_BY_CATEGORY = NOTIFICATION_LIBRARY.reduce(
  (acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  },
  {} as Record<NotificationCategory, TrackItNotificationMessage[]>,
);
