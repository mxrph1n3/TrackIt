import { Platform } from 'react-native';

import {
  ensureNotificationPermissions,
  loadNotificationsModule,
  configureNotificationHandler,
} from './reminderService';
import { buildNotificationContext } from './contextBuilder';
import { NOTIFICATION_SCHEDULE_SLOTS, SLOT_IDS } from './scheduleSlots';
import { selectNotificationForSlot } from './selector';
import { markUserActivityToday } from './activityTracking';
import type { NotificationContext } from './types';

async function ensureAndroidChannel(
  Notifications: NonNullable<Awaited<ReturnType<typeof loadNotificationsModule>>>,
  channelId: string,
  name: string,
) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name,
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

async function scheduleSlotNotification(
  Notifications: NonNullable<Awaited<ReturnType<typeof loadNotificationsModule>>>,
  slotId: string,
  hour: number,
  minute: number,
  channelId: string,
  channelName: string,
  title: string,
  body: string,
  deepLink?: string,
): Promise<void> {
  await ensureAndroidChannel(Notifications, channelId, channelName);
  await Notifications.cancelScheduledNotificationAsync(slotId);

  await Notifications.scheduleNotificationAsync({
    identifier: slotId,
    content: {
      title,
      body,
      sound: false,
      data: deepLink ? { url: deepLink } : {},
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? channelId : undefined,
    },
  });
}

export async function cancelAllTrackItNotifications(): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  await Promise.all(SLOT_IDS.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

export async function refreshTrackItNotifications(options: {
  enabled: boolean;
  hardcoreMode: boolean;
  userId: string | undefined;
  daysInactive?: number;
}): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  await configureNotificationHandler(Notifications);
  await cancelAllTrackItNotifications();

  if (!options.enabled || !options.userId) {
    return;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) {
    return;
  }

  const context = await buildNotificationContext({
    ...options,
    daysInactiveOverride: options.daysInactive,
  });

  if (context.hasActivityToday) {
    await markUserActivityToday();
  }

  await scheduleFromContext(context);
}

async function scheduleFromContext(context: NotificationContext): Promise<void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications || !context.enabled) {
    return;
  }

  for (const slotConfig of NOTIFICATION_SCHEDULE_SLOTS) {
    const message = selectNotificationForSlot(slotConfig.slot, context);
    if (!message) {
      continue;
    }

    await scheduleSlotNotification(
      Notifications,
      slotConfig.id,
      slotConfig.hour,
      slotConfig.minute,
      slotConfig.channelId,
      slotConfig.channelName,
      message.title ?? 'TrackIt',
      message.body,
      message.deepLink,
    );
  }
}
