import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { TRACKIT_DEEP_LINKS } from '../navigation/deepLinkRouter';

const DAILY_PLANNER_REMINDER_ID = 'trackit-daily-planner-reminder';
const HABIT_REMINDER_ID = 'trackit-habit-reminder';
const WORKOUT_REMINDER_ID = 'trackit-workout-reminder';

export const notificationsSupportedInRuntime =
  Constants.appOwnership !== 'expo' && Platform.OS !== 'web';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;
let handlerConfigured = false;

export async function loadNotificationsModule(): Promise<NotificationsModule | null> {
  return loadNotifications();
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsSupportedInRuntime) {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    notificationsModule = await import('expo-notifications');
    return notificationsModule;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export async function configureNotificationHandler(Notifications: NotificationsModule) {
  if (handlerConfigured) {
    return;
  }

  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function extractDeepLinkUrl(data: Record<string, unknown> | undefined): string | null {
  const url = data?.url;
  return typeof url === 'string' ? url : null;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }

  await configureNotificationHandler(Notifications);

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function ensureAndroidChannel(Notifications: NotificationsModule, channelId: string, name: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function scheduleDailyPlannerReminder(hour = 9, minute = 0): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await configureNotificationHandler(Notifications);

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return;
  }

  await ensureAndroidChannel(Notifications, 'planner-reminders', 'Planner reminders');
  await Notifications.cancelScheduledNotificationAsync(DAILY_PLANNER_REMINDER_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_PLANNER_REMINDER_ID,
    content: {
      title: 'TrackIt Planner',
      body: 'Review today’s tasks and habits.',
      sound: false,
      data: { url: TRACKIT_DEEP_LINKS.planner },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'planner-reminders' : undefined,
    },
  });
}

export async function scheduleHabitReminder(hour = 20, minute = 0): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await configureNotificationHandler(Notifications);

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return;
  }

  await ensureAndroidChannel(Notifications, 'habit-reminders', 'Habit reminders');
  await Notifications.cancelScheduledNotificationAsync(HABIT_REMINDER_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: HABIT_REMINDER_ID,
    content: {
      title: 'TrackIt Habits',
      body: 'Log today’s habits before the day ends.',
      sound: false,
      data: { url: TRACKIT_DEEP_LINKS.habits },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'habit-reminders' : undefined,
    },
  });
}

export async function scheduleWorkoutReminder(hour = 18, minute = 0): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await configureNotificationHandler(Notifications);

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return;
  }

  await ensureAndroidChannel(Notifications, 'workout-reminders', 'Workout reminders');
  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: WORKOUT_REMINDER_ID,
    content: {
      title: 'TrackIt Workout',
      body: 'Time to train — open your workout plan.',
      sound: false,
      data: { url: TRACKIT_DEEP_LINKS.workout },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'workout-reminders' : undefined,
    },
  });
}

export async function cancelPlannerReminders(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(DAILY_PLANNER_REMINDER_ID);
}

export async function cancelHabitReminders(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(HABIT_REMINDER_ID);
}

export async function cancelWorkoutReminders(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID);
}

export function subscribeToNotificationResponses(onUrl: (url: string) => void): () => void {
  let subscription: { remove: () => void } | null = null;
  let cancelled = false;

  void loadNotifications().then((Notifications) => {
    if (!Notifications || cancelled) {
      return;
    }

    void configureNotificationHandler(Notifications);
    subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = extractDeepLinkUrl(response.notification.request.content.data);
      if (url) {
        onUrl(url);
      }
    });
  });

  return () => {
    cancelled = true;
    subscription?.remove();
  };
}

export async function readNotificationDeepLink(): Promise<string | null> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return null;
  }

  const response = await Notifications.getLastNotificationResponseAsync();
  return extractDeepLinkUrl(response?.notification.request.content.data);
}
