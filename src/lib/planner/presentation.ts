import type { PlannerPrioritizedTask, PlannerProjectTimeline, PlannerSubtask, PlannerTaskItem } from '../../types/planner';
import { addDays, parseDayKey } from '../../utils/plannerDates';

const TIMELINE_DAY_COUNT = 4;

function timelineWindowStart(anchorDayKey: string): Date {
  const start = addDays(parseDayKey(anchorDayKey), -2);
  start.setHours(0, 0, 0, 0);
  return start;
}

function taskDayIndex(task: PlannerTaskItem, anchorDayKey: string): number | null {
  const key = task.dueDate ?? anchorDayKey;
  const windowStart = timelineWindowStart(anchorDayKey);
  const taskDate = parseDayKey(key);
  taskDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((taskDate.getTime() - windowStart.getTime()) / 86_400_000);

  if (diffDays < 0 || diffDays >= TIMELINE_DAY_COUNT) {
    return null;
  }

  return diffDays;
}

export function taskCompletionProgress(task: PlannerTaskItem): number {
  if (task.subtasks?.length) {
    const completed = task.subtasks.filter((item) => item.completed).length;
    return completed / task.subtasks.length;
  }
  return task.completed ? 1 : 0;
}

export function allSubtasksComplete(subtasks?: PlannerSubtask[]): boolean {
  return (subtasks?.length ?? 0) > 0 && subtasks!.every((item) => item.completed);
}

export function hasPartialSubtaskProgress(subtasks?: PlannerSubtask[]): boolean {
  if (!subtasks?.length) {
    return false;
  }
  const completed = subtasks.filter((item) => item.completed).length;
  return completed > 0 && completed < subtasks.length;
}

export function buildPrioritizedTasks(tasks: PlannerTaskItem[]): PlannerPrioritizedTask[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    time: task.time,
    completed: task.completed,
    subtasks: task.subtasks,
  }));
}

export function buildProjectTimelines(
  tasks: PlannerTaskItem[],
  anchorDayKey: string,
): PlannerProjectTimeline[] {
  if (tasks.length === 0) {
    return [];
  }

  return tasks
    .map((task) => {
      const dayIndex = taskDayIndex(task, anchorDayKey);
      if (dayIndex === null) {
        return null;
      }

      const subtaskTotal = task.subtasks?.length ?? 0;
      const subtaskDone = task.subtasks?.filter((item) => item.completed).length ?? 0;
      const progress = taskCompletionProgress(task);

      return {
        id: `project-${task.id}`,
        title: task.title,
        dayIndex,
        progress,
        isComplete: task.completed || progress >= 1,
        time: task.time,
        subtaskDone,
        subtaskTotal,
      };
    })
    .filter((item): item is PlannerProjectTimeline => item !== null)
    .sort((a, b) => a.dayIndex - b.dayIndex || b.progress - a.progress)
    .slice(0, 6);
}
