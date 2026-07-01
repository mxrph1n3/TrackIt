import { fetchTodayTasks } from '../dashboard/service';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useHealthStore } from '../../stores/useHealthStore';
import {
  activityDayKey,
  computeDaysInactive,
  hasUserActivityToday,
  readLastActiveDate,
} from './activityTracking';
import type { NotificationContext } from './types';

export async function buildNotificationContext(options: {
  enabled: boolean;
  hardcoreMode: boolean;
  userId: string | undefined;
  daysInactiveOverride?: number;
}): Promise<NotificationContext> {
  const todayKey = activityDayKey(new Date());
  const lastActive = await readLastActiveDate();
  const daysInactive =
    options.daysInactiveOverride ??
    computeDaysInactive(lastActive, todayKey);

  const profile = useGamificationStore.getState().profile;
  const schedule = useDashboardStore.getState().schedule;
  const workoutToday = useHealthStore.getState().lastSession.relativeDay === 'Today';

  let tasks = schedule;
  if (options.userId && tasks.length === 0) {
    try {
      tasks = await fetchTodayTasks(options.userId);
    } catch {
      tasks = [];
    }
  }

  const totalTaskCount = tasks.length;
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const incompleteTaskCount = totalTaskCount - completedTaskCount;
  const allTasksComplete = totalTaskCount > 0 && incompleteTaskCount === 0;

  const streakDays = Math.max(
    profile?.days_active ?? 0,
    useDashboardStore.getState().focusStreakDays,
  );

  const activityFromTasks = completedTaskCount > 0;
  const activityFromStorage = await hasUserActivityToday();
  const hasActivityToday = activityFromTasks || workoutToday || activityFromStorage;

  return {
    incompleteTaskCount,
    totalTaskCount,
    completedTaskCount,
    streakDays,
    daysInactive,
    hasActivityToday,
    allTasksComplete,
    hardcoreMode: options.hardcoreMode,
    enabled: options.enabled,
  };
}
