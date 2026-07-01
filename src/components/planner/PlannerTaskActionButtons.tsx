import { AddTaskPillButton } from '../ui/AddTaskPillButton';

type PlannerTaskActionButtonsProps = {
  onAddTask: () => void;
};

export function PlannerTaskActionButtons({ onAddTask }: PlannerTaskActionButtonsProps) {
  return (
    <AddTaskPillButton
      onPress={onAddTask}
      label="New task"
      fullWidth
      accessibilityLabel="Create new task"
    />
  );
}
