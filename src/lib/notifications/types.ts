import type { TRACKIT_DEEP_LINKS } from '../navigation/deepLinkRouter';

export type NotificationCategory =
  | 'reminder_tasks'
  | 'reminder_workout'
  | 'reminder_nutrition'
  | 'reminder_finance'
  | 'motivation'
  | 'hardcore'
  | 'philosophy'
  | 'trackit_original'
  | 'streak'
  | 'celebration'
  | 'comeback';

export type NotificationPriority = 'low' | 'normal' | 'high';

export type NotificationTimeSlot =
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'late';

export type TrackItNotificationMessage = {
  id: string;
  category: NotificationCategory;
  body: string;
  title?: string;
  priority: NotificationPriority;
  time: NotificationTimeSlot | 'anytime';
  deepLink?: (typeof TRACKIT_DEEP_LINKS)[keyof typeof TRACKIT_DEEP_LINKS];
};

export type NotificationContext = {
  incompleteTaskCount: number;
  totalTaskCount: number;
  completedTaskCount: number;
  streakDays: number;
  daysInactive: number;
  hasActivityToday: boolean;
  allTasksComplete: boolean;
  hardcoreMode: boolean;
  enabled: boolean;
};

export type ScheduledSlotConfig = {
  id: string;
  hour: number;
  minute: number;
  slot: NotificationTimeSlot;
  channelId: string;
  channelName: string;
  /** Always fire at this time when true. */
  always?: boolean;
};
