import { useTranslation } from 'react-i18next';

/** Planner ecosystem copy — TrackIt 2.0 (i18n) */
export function usePlannerCopy() {
  const { t } = useTranslation();

  return {
    screenTitle: t('planner.title'),
    todayFocus: t('planner.todaysFocus'),
    tasks: t('planner.sections.tasks'),
    workouts: t('planner.sections.workouts'),
    nutrition: t('planner.sections.nutrition'),
    finance: t('planner.sections.finance'),
    stats: t('planner.sections.stats'),
    projects: t('planner.sections.projects'),
    habits: t('planner.sections.habits'),
    viewAll: t('planner.viewAll'),
    open: t('planner.open'),
    addJournal: t('planner.addEntry'),
    editJournal: t('planner.edit'),
    noTasks: t('planner.empty.tasks'),
    noProjects: t('planner.empty.projects'),
    startWorkout: t('planner.startWorkout'),
    logMeal: t('planner.logMeal'),
  } as const;
}
