import { TaskCreationSheet } from './TaskCreationSheet';
import { createPlannerTask } from '../../lib/planner/createTask';
import { reportSyncError } from '../../lib/sync/reportSyncError';
import { usePlannerStore } from '../../stores/usePlannerStore';

export function TaskCreationHost() {
  const isOpen = usePlannerStore((state) => state.isTaskSheetOpen);
  const initialDayKey = usePlannerStore((state) => state.taskSheetDayKey);
  const closeTaskSheet = usePlannerStore((state) => state.closeTaskSheet);

  const handleSubmit = async (title: string, dueDate: string, subtasks: string[]) => {
    try {
      await createPlannerTask({ title, dueDate, subtasks });
    } catch (error) {
      reportSyncError('Planner', error, 'Could not add the task.');
      throw error instanceof Error ? error : new Error('Could not add the task.');
    }
  };

  return (
    <TaskCreationSheet
      visible={isOpen}
      initialDayKey={initialDayKey}
      onClose={closeTaskSheet}
      onSubmit={handleSubmit}
    />
  );
}
