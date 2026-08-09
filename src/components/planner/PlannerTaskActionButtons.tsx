import { useTranslation } from 'react-i18next';

import { AddTaskPillButton } from '../ui/AddTaskPillButton';

type PlannerTaskActionButtonsProps = {
  onAddTask: () => void;
};

export function PlannerTaskActionButtons({ onAddTask }: PlannerTaskActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <AddTaskPillButton
      onPress={onAddTask}
      label={t('planner.newTaskBtn')}
      fullWidth
      accessibilityLabel={t('welcome.createTask')}
    />
  );
}
