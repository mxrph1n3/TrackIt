import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVE_KEY = 'trackit:last-active-date';
const LAST_ACTIVITY_KEY = 'trackit:last-activity-date';

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayDiff(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T12:00:00`);
  const to = new Date(`${toKey}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export async function readLastActiveDate(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_ACTIVE_KEY);
}

export async function readLastActivityDate(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_ACTIVITY_KEY);
}

/** Call on app foreground to track absence for comeback messages. */
export async function touchAppOpen(): Promise<{ daysInactive: number; todayKey: string }> {
  const todayKey = toDayKey(new Date());
  const previous = await readLastActiveDate();

  if (previous !== todayKey) {
    await AsyncStorage.setItem(LAST_ACTIVE_KEY, todayKey);
  }

  const daysInactive = previous ? Math.max(0, dayDiff(previous, todayKey)) : 0;
  return { daysInactive, todayKey };
}

/** Mark that the user did something meaningful today (task, workout, etc.). */
export async function markUserActivityToday(): Promise<void> {
  await AsyncStorage.setItem(LAST_ACTIVITY_KEY, toDayKey(new Date()));
}

export async function hasUserActivityToday(): Promise<boolean> {
  const todayKey = toDayKey(new Date());
  const last = await readLastActivityDate();
  return last === todayKey;
}

export function computeDaysInactive(lastActiveKey: string | null, todayKey: string): number {
  if (!lastActiveKey) {
    return 0;
  }
  return Math.max(0, dayDiff(lastActiveKey, todayKey));
}

export { toDayKey as activityDayKey };
