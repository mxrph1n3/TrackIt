import { LIBRARY_BY_CATEGORY, NOTIFICATION_LIBRARY } from './library';
import type {
  NotificationCategory,
  NotificationContext,
  NotificationTimeSlot,
  TrackItNotificationMessage,
} from './types';

const COMEBACK_THRESHOLDS = [1, 2, 3, 5, 7, 14] as const;

function daySeed(): number {
  const now = new Date();
  return now.getFullYear() * 1000 + now.getMonth() * 32 + now.getDate();
}

function pickFromPool(pool: TrackItNotificationMessage[], salt: string): TrackItNotificationMessage {
  if (pool.length === 0) {
    return NOTIFICATION_LIBRARY[0];
  }
  const index = Math.abs(daySeed() + hashString(salt)) % pool.length;
  return pool[index];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function poolForCategories(
  categories: NotificationCategory[],
  slot: NotificationTimeSlot,
  hardcoreMode: boolean,
): TrackItNotificationMessage[] {
  const items: TrackItNotificationMessage[] = [];

  for (const category of categories) {
    const categoryPool = LIBRARY_BY_CATEGORY[category] ?? [];
    const slotFiltered = categoryPool.filter(
      (item) => item.time === 'anytime' || item.time === slot,
    );
    items.push(...(slotFiltered.length > 0 ? slotFiltered : categoryPool));
  }

  if (hardcoreMode) {
    const hardcore = LIBRARY_BY_CATEGORY.hardcore.filter(
      (item) => item.time === 'anytime' || item.time === slot,
    );
    items.push(...hardcore);
  }

  return items;
}

function pickComebackMessage(daysInactive: number): TrackItNotificationMessage | null {
  if (daysInactive <= 0) {
    return null;
  }

  let thresholdIndex = -1;
  for (let i = COMEBACK_THRESHOLDS.length - 1; i >= 0; i -= 1) {
    if (daysInactive >= COMEBACK_THRESHOLDS[i]) {
      thresholdIndex = i;
      break;
    }
  }

  if (thresholdIndex < 0) {
    return null;
  }

  const pool = LIBRARY_BY_CATEGORY.comeback;
  return pool[Math.min(thresholdIndex, pool.length - 1)] ?? null;
}

function withTaskCount(message: TrackItNotificationMessage, count: number): TrackItNotificationMessage {
  if (count <= 0) {
    return message;
  }

  const body = message.body.replace(/\d+/, String(count));
  if (body === message.body && count > 0) {
    return {
      ...message,
      body: `${count} ${pluralTasks(count)} left for today.`,
    };
  }

  return { ...message, body };
}

function pluralTasks(count: number): string {
  return count === 1 ? 'task' : 'tasks';
}

export function selectNotificationForSlot(
  slot: NotificationTimeSlot,
  context: NotificationContext,
): TrackItNotificationMessage | null {
  if (!context.enabled) {
    return null;
  }

  switch (slot) {
    case 'morning': {
      const comeback = pickComebackMessage(context.daysInactive);
      if (comeback) {
        return comeback;
      }

      if (context.streakDays >= 3) {
        const streakPool = poolForCategories(['streak'], slot, false);
        if (streakPool.length > 0 && daySeed() % 3 === 0) {
          return pickFromPool(streakPool, 'morning-streak');
        }
      }

      const morningPool = poolForCategories(
        ['motivation', 'philosophy', 'trackit_original'],
        slot,
        context.hardcoreMode,
      );
      return pickFromPool(morningPool, 'morning-core');
    }

    case 'midday': {
      if (context.incompleteTaskCount > 0) {
        const taskPool = poolForCategories(['reminder_tasks'], slot, false);
        return withTaskCount(pickFromPool(taskPool, 'midday-tasks'), context.incompleteTaskCount);
      }

      if (context.totalTaskCount === 0 && !context.hasActivityToday) {
        return null;
      }

      const contextual = poolForCategories(['reminder_nutrition', 'reminder_workout'], slot, false);
      return pickFromPool(contextual, 'midday-context');
    }

    case 'afternoon': {
      if (context.incompleteTaskCount > 0) {
        const taskPool = poolForCategories(['reminder_tasks', 'trackit_original'], slot, false);
        return withTaskCount(pickFromPool(taskPool, 'afternoon-tasks'), context.incompleteTaskCount);
      }

      const progressPool = poolForCategories(['trackit_original', 'motivation'], slot, context.hardcoreMode);
      return pickFromPool(progressPool, 'afternoon-progress');
    }

    case 'evening': {
      const eveningPool = poolForCategories(['reminder_tasks', 'reminder_finance', 'trackit_original'], slot, false);
      return pickFromPool(eveningPool, 'evening-close');
    }

    case 'night': {
      if (context.allTasksComplete) {
        const celebrationPool = poolForCategories(['celebration'], slot, false);
        return pickFromPool(celebrationPool, 'night-celebration');
      }

      const finishPool = poolForCategories(['motivation', 'reminder_tasks', 'trackit_original'], slot, context.hardcoreMode);
      return pickFromPool(finishPool, 'night-finish');
    }

    case 'late': {
      if (context.hasActivityToday) {
        return null;
      }

      return {
        id: 'late-nudge',
        category: 'trackit_original',
        body: "It's still not too late today to take at least one step.",
        title: 'TrackIt',
        priority: 'high',
        time: 'late',
      };
    }

    default:
      return null;
  }
}
