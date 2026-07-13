import { isAppFullyFree } from './appAccess.ts';
import { getServiceClient } from './tmaAccess.ts';
import { getBotConfig, sendBotMessage } from './telegramBot.ts';

export type ReminderSlot = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'late';

export type ReminderSlotConfig = {
  id: string;
  slot: ReminderSlot;
  hour: number;
  minute: number;
  always?: boolean;
};

export const REMINDER_SLOTS: ReminderSlotConfig[] = [
  { id: 'trackit-slot-morning', slot: 'morning', hour: 8, minute: 0, always: true },
  { id: 'trackit-slot-midday', slot: 'midday', hour: 12, minute: 0 },
  { id: 'trackit-slot-afternoon', slot: 'afternoon', hour: 16, minute: 0 },
  { id: 'trackit-slot-evening', slot: 'evening', hour: 19, minute: 0 },
  { id: 'trackit-slot-night', slot: 'night', hour: 21, minute: 0 },
  { id: 'trackit-slot-late', slot: 'late', hour: 22, minute: 0 },
];

type ReminderContext = {
  incompleteTaskCount: number;
  totalTaskCount: number;
  completedTaskCount: number;
  streakDays: number;
  daysInactive: number;
  hasActivityToday: boolean;
  allTasksComplete: boolean;
};

type ReminderMessage = {
  title: string;
  body: string;
};

type ProfileRow = {
  id: string;
  telegram_user_id: number;
  timezone: string;
  days_active: number;
  last_active_at: string | null;
};

const MESSAGES: Record<ReminderSlot, string[]> = {
  morning: [
    "Don't forget why you started.",
    "You're capable of much more.",
    'Today either you run the day or the day runs you.',
    'Small daily actions beat rare heroic feats.',
    'Discipline always beats motivation.',
    'One habit can change your whole life.',
    'Good morning — what is the one thing that matters today?',
  ],
  midday: [
    'You still have unfinished tasks today.',
    "Don't forget to mark completed items.",
    'Take the next step.',
    'Even 5 minutes today is better than nothing.',
    'Today is workout day.',
    "Don't skip your workout.",
    'Time for your next meal.',
    'Log your diet.',
  ],
  afternoon: [
    'You can still make today a success.',
    'Your progress is waiting for you.',
    'Half the day is gone — make the rest count.',
    'One completed item beats ten planned ones.',
  ],
  evening: [
    'Not much time left in the day.',
    "Come back and close today's list.",
    "Log today's expenses.",
    'Check your budget.',
    'Any purchases today?',
  ],
  night: [
    'You can still make today a success.',
    'Finish strong — even one win counts.',
    'All tasks done — great work today!',
    'You showed up today. That matters.',
  ],
  late: ["It's still not too late today to take at least one step."],
};

const COMEBACK_MESSAGES = [
  'Welcome back — pick one small win for today.',
  'We missed you. Open TrackIt and take the first step.',
  'A fresh start beats a perfect plan. Come back today.',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function daySeed(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number);
  return year * 1000 + month * 32 + day;
}

function pickFromPool(pool: string[], salt: string, dateKey: string): string {
  if (pool.length === 0) return 'Open TrackIt and keep moving forward.';
  const index = Math.abs(daySeed(dateKey) + hashString(salt)) % pool.length;
  return pool[index];
}

function getLocalDateParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  const year = read('year');
  const month = read('month');
  const day = read('day');
  const hour = read('hour');
  const minute = read('minute');

  return {
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    hour: hour === 24 ? 0 : hour,
    minute,
  };
}

function computeDaysInactive(lastActiveAt: string | null, dateKey: string, timezone: string): number {
  if (!lastActiveAt) return 0;

  const lastParts = getLocalDateParts(new Date(lastActiveAt), timezone);
  const lastMs = Date.parse(`${lastParts.dateKey}T00:00:00Z`);
  const todayMs = Date.parse(`${dateKey}T00:00:00Z`);
  const diffDays = Math.floor((todayMs - lastMs) / (24 * 60 * 60 * 1000));
  return diffDays > 0 ? diffDays : 0;
}

function isSameLocalDay(iso: string, date: Date, timezone: string): boolean {
  const activeParts = getLocalDateParts(new Date(iso), timezone);
  const nowParts = getLocalDateParts(date, timezone);
  return activeParts.dateKey === nowParts.dateKey;
}

function withTaskCount(message: string, count: number): string {
  if (count <= 0) return message;
  if (message.includes('unfinished tasks')) {
    return message.replace('unfinished tasks', `${count} unfinished ${count === 1 ? 'task' : 'tasks'}`);
  }
  return `${count} ${count === 1 ? 'task' : 'tasks'} left for today. ${message}`;
}

function selectReminderMessage(slot: ReminderSlot, context: ReminderContext, dateKey: string): string | null {
  switch (slot) {
    case 'morning': {
      if (context.daysInactive >= 1) {
        const index = Math.min(context.daysInactive - 1, COMEBACK_MESSAGES.length - 1);
        return COMEBACK_MESSAGES[index];
      }
      if (context.streakDays >= 3 && daySeed(dateKey) % 3 === 0) {
        return `🔥 ${context.streakDays}-day streak — keep it going today.`;
      }
      return pickFromPool(MESSAGES.morning, 'morning', dateKey);
    }
    case 'midday': {
      if (context.incompleteTaskCount > 0) {
        return withTaskCount(pickFromPool(MESSAGES.midday, 'midday-tasks', dateKey), context.incompleteTaskCount);
      }
      if (context.totalTaskCount === 0 && !context.hasActivityToday) {
        return null;
      }
      return pickFromPool(MESSAGES.midday, 'midday-context', dateKey);
    }
    case 'afternoon': {
      if (context.incompleteTaskCount > 0) {
        return withTaskCount(pickFromPool(MESSAGES.afternoon, 'afternoon-tasks', dateKey), context.incompleteTaskCount);
      }
      return pickFromPool(MESSAGES.afternoon, 'afternoon-progress', dateKey);
    }
    case 'evening':
      return pickFromPool(MESSAGES.evening, 'evening', dateKey);
    case 'night': {
      if (context.allTasksComplete) {
        return pickFromPool(MESSAGES.night.filter((m) => m.includes('done') || m.includes('showed up')), 'night-win', dateKey);
      }
      return pickFromPool(MESSAGES.night, 'night-finish', dateKey);
    }
    case 'late':
      return context.hasActivityToday ? null : MESSAGES.late[0];
    default:
      return null;
  }
}

function isSlotDue(localHour: number, localMinute: number, slotHour: number, slotMinute: number): boolean {
  const nowTotal = localHour * 60 + localMinute;
  const slotTotal = slotHour * 60 + slotMinute;
  return nowTotal >= slotTotal && nowTotal < slotTotal + 15;
}

async function buildReminderContext(userId: string, profile: ProfileRow, dateKey: string, timezone: string): Promise<ReminderContext> {
  const service = getServiceClient();

  const { data: tasks } = await service
    .from('tasks')
    .select('completed')
    .eq('user_id', userId)
    .eq('due_date', dateKey);

  const taskRows = tasks ?? [];
  const totalTaskCount = taskRows.length;
  const completedTaskCount = taskRows.filter((task) => task.completed).length;
  const incompleteTaskCount = totalTaskCount - completedTaskCount;

  const { data: workout } = await service
    .from('workout_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('session_date', dateKey)
    .maybeSingle();

  const daysInactive = computeDaysInactive(profile.last_active_at, dateKey, timezone);
  const activityFromOpen = profile.last_active_at
    ? isSameLocalDay(profile.last_active_at, new Date(), timezone)
    : false;
  const hasActivityToday = completedTaskCount > 0 || !!workout || activityFromOpen;

  return {
    incompleteTaskCount,
    totalTaskCount,
    completedTaskCount,
    streakDays: profile.days_active,
    daysInactive,
    hasActivityToday,
    allTasksComplete: totalTaskCount > 0 && incompleteTaskCount === 0,
  };
}

function buildReminderKeyboard(webAppUrl: string) {
  return {
    inline_keyboard: [[{ text: '🚀 Open TrackIt', web_app: { url: webAppUrl } }]],
  };
}

const SLOT_LABELS: Record<ReminderSlot, string> = {
  morning: '🌅 Morning',
  midday: '☀️ Midday',
  afternoon: '📈 Progress',
  evening: '🌆 Evening',
  night: '🌙 Summary',
  late: '⏰ Final nudge',
};

export async function processTelegramReminders(now = new Date()): Promise<{ sent: number; skipped: number }> {
  const config = getBotConfig();
  if (!config) {
    throw new Error('Telegram bot is not configured.');
  }

  const service = getServiceClient();
  const { data: profiles, error } = await service
    .from('profiles')
    .select('id, telegram_user_id, timezone, days_active, last_active_at')
    .eq('telegram_reminders_enabled', true)
    .not('telegram_user_id', 'is', null);

  if (error) {
    throw error;
  }

  let sent = 0;
  let skipped = 0;

  for (const profile of profiles ?? []) {
    if (!profile.telegram_user_id) continue;

    const { data: hasPremium } = await service.rpc('user_has_premium_access', { p_user_id: profile.id });
    if (!isAppFullyFree() && !hasPremium) {
      skipped += 1;
      continue;
    }

    const timezone = profile.timezone?.trim() || 'UTC';
    const local = getLocalDateParts(now, timezone);

    for (const slotConfig of REMINDER_SLOTS) {
      if (!isSlotDue(local.hour, local.minute, slotConfig.hour, slotConfig.minute)) {
        continue;
      }

      const { data: existing } = await service
        .from('telegram_reminder_deliveries')
        .select('id')
        .eq('user_id', profile.id)
        .eq('slot_id', slotConfig.id)
        .eq('delivery_date', local.dateKey)
        .maybeSingle();

      if (existing?.id) {
        skipped += 1;
        continue;
      }

      const context = await buildReminderContext(profile.id, profile as ProfileRow, local.dateKey, timezone);
      const body = selectReminderMessage(slotConfig.slot, context, local.dateKey);
      if (!body) {
        skipped += 1;
        continue;
      }

      const message: ReminderMessage = {
        title: SLOT_LABELS[slotConfig.slot],
        body,
      };

      await sendBotMessage(
        config,
        profile.telegram_user_id,
        `<b>${message.title}</b>\n${message.body}`,
        buildReminderKeyboard(config.webAppUrl),
      );

      const { error: insertError } = await service.from('telegram_reminder_deliveries').insert({
        user_id: profile.id,
        slot_id: slotConfig.id,
        delivery_date: local.dateKey,
      });

      if (insertError && !insertError.message.includes('duplicate')) {
        console.error('[telegram-reminders] delivery insert failed:', insertError.message);
      } else {
        sent += 1;
      }
    }
  }

  return { sent, skipped };
}
