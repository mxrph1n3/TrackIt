import { insertTask } from '../quickActions/service';
import { reportSyncSuccess } from '../sync/reportSyncError';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useTasksSyncStore } from '../../stores/useTasksSyncStore';
import type { NewTaskDraft } from '../../types/planner';
import { toDayKey } from '../../utils/plannerDates';
import { insertSubtask } from './subtaskService';

export async function createPlannerTask(draft: NewTaskDraft): Promise<void> {
  const title = draft.title.trim();
  if (!title) {
    throw new Error('Task title is required.');
  }

  const dueDate = draft.dueDate;
  const isToday = dueDate === toDayKey(new Date());

  const row = await insertTask({
    title,
    dueDate,
    isToday,
  });

  const userId = useGamificationStore.getState().profile?.id;
  const subtaskTitles = (draft.subtasks ?? [])
    .map((item) => item.trim())
    .filter(Boolean);

  if (userId && subtaskTitles.length > 0) {
    await Promise.all(
      subtaskTitles.map((subtaskTitle) => insertSubtask(userId, row.id, subtaskTitle)),
    );
  }

  useTasksSyncStore.getState().notifyTaskMutation();
  reportSyncSuccess('Task added.');
}
