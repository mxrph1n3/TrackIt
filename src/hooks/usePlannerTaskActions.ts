import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { toggleTaskCompletion } from '../lib/dashboard/service';
import { recordMonetizedTaskIncome, reverseMonetizedTaskIncome } from '../lib/finance/ecosystem';
import { allSubtasksComplete } from '../lib/planner/presentation';
import { fetchTasksForDay } from '../lib/planner/service';
import {
  setSubtasksCompletionForTask,
  toggleSubtaskCompletion,
} from '../lib/planner/subtaskService';
import { reportSyncError } from '../lib/sync/reportSyncError';
import { useGamificationStore } from '../stores/useGamificationStore';
import type { PlannerTaskItem } from '../types/planner';
import { toDayKey } from '../utils/plannerDates';
import { useProgression } from './useProgression';

type UsePlannerTaskActionsOptions = {
  tasks: PlannerTaskItem[];
  setTasks: Dispatch<SetStateAction<PlannerTaskItem[]>>;
  onAfterToggle?: () => void | Promise<void>;
};

export function usePlannerTaskActions({
  tasks,
  setTasks,
  onAfterToggle,
}: UsePlannerTaskActionsOptions) {
  const { profile, awardXp, checkDailyStreakBonus } = useProgression();

  const maybeAwardDailyStreak = useCallback(async () => {
    const userId = profile?.id ?? useGamificationStore.getState().profile?.id;
    if (!userId) {
      return;
    }

    const todayTasks = await fetchTasksForDay(userId, toDayKey(new Date()));
    const completedCount = todayTasks.filter((task) => task.completed).length;
    await checkDailyStreakBonus(completedCount, todayTasks.length);
  }, [checkDailyStreakBonus, profile?.id]);

  const syncParentCompletion = useCallback(
    async (taskId: string, shouldComplete: boolean, currentlyCompleted: boolean) => {
      if (currentlyCompleted === shouldComplete) {
        return;
      }

      await toggleTaskCompletion(taskId, shouldComplete);
      if (shouldComplete) {
        await recordMonetizedTaskIncome(taskId);
        await awardXp('TASK_COMPLETE');
      } else {
        await reverseMonetizedTaskIncome(taskId);
      }
    },
    [awardXp],
  );

  const toggleTask = useCallback(
    async (taskId: string) => {
      const item = tasks.find((task) => task.id === taskId);
      if (!item) {
        return;
      }

      const hasSubtasks = (item.subtasks?.length ?? 0) > 0;
      const nextCompleted = !item.completed;
      const previousTasks = tasks;

      const nextTasks = tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: nextCompleted,
              subtasks: hasSubtasks
                ? task.subtasks?.map((subtask) => ({ ...subtask, completed: nextCompleted }))
                : task.subtasks,
            }
          : task,
      );

      setTasks(nextTasks);

      try {
        const userId = profile?.id ?? useGamificationStore.getState().profile?.id;

        if (hasSubtasks && userId) {
          await setSubtasksCompletionForTask(userId, taskId, nextCompleted);
          if (nextCompleted) {
            const newlyCompletedCount = item.subtasks!.filter((subtask) => !subtask.completed).length;
            for (let index = 0; index < newlyCompletedCount; index += 1) {
              await awardXp('SUBTASK_COMPLETE');
            }
          }
        }

        await syncParentCompletion(taskId, nextCompleted, item.completed);

        if (nextCompleted) {
          await maybeAwardDailyStreak();
        }

        await onAfterToggle?.();
      } catch (error) {
        reportSyncError('Planner', error, 'Could not update the task.');
        setTasks(previousTasks);
      }
    },
    [awardXp, maybeAwardDailyStreak, onAfterToggle, profile?.id, syncParentCompletion, setTasks, tasks],
  );

  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((entry) => entry.id === taskId);
      const subtask = task?.subtasks?.find((entry) => entry.id === subtaskId);
      if (!task || !subtask) {
        return;
      }

      const nextCompleted = !subtask.completed;
      const previousTasks = tasks;
      const updatedSubtasks = task.subtasks!.map((item) =>
        item.id === subtaskId ? { ...item, completed: nextCompleted } : item,
      );
      const shouldCompleteParent = allSubtasksComplete(updatedSubtasks);

      setTasks((current) =>
        current.map((entry) =>
          entry.id === taskId
            ? {
                ...entry,
                subtasks: updatedSubtasks,
                completed: shouldCompleteParent,
              }
            : entry,
        ),
      );

      try {
        await toggleSubtaskCompletion(subtaskId, nextCompleted);
        if (nextCompleted) {
          await awardXp('SUBTASK_COMPLETE');
        }
        await syncParentCompletion(taskId, shouldCompleteParent, task.completed);

        if (nextCompleted || shouldCompleteParent) {
          await maybeAwardDailyStreak();
        }

        await onAfterToggle?.();
      } catch (error) {
        reportSyncError('Planner', error, 'Could not update the subtask.');
        setTasks(previousTasks);
      }
    },
    [awardXp, maybeAwardDailyStreak, onAfterToggle, syncParentCompletion, setTasks, tasks],
  );

  return { toggleTask, toggleSubtask };
}
