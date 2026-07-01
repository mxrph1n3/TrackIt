import { navigateHealthScreen, navigateTab } from '../../navigation/navigationRef';
import { useHealthHubNavigationStore } from '../../stores/useHealthHubNavigationStore';
import { useHealthStore } from '../../stores/useHealthStore';
import { usePlannerNavigationStore } from '../../stores/usePlannerNavigationStore';
import { useProfileModuleStore, type ProfileStackModuleId } from '../../stores/useProfileModuleStore';

export const TRACKIT_DEEP_LINKS = {
  dashboard: 'trackit2://dashboard',
  planner: 'trackit2://planner',
  plannerTasks: 'trackit2://planner/tasks',
  habits: 'trackit2://module/habits',
  workout: 'trackit2://health/workout',
  workoutStart: 'trackit2://health/workout/start',
  foodSearch: 'trackit2://health/food-search',
  finance: 'trackit2://module/finance',
} as const;

const PROFILE_MODULE_PATHS: Record<string, ProfileStackModuleId> = {
  habits: 'habits',
  focus: 'focus',
  finance: 'finance',
  achievements: 'achievements',
  settings: 'settings',
  journal: 'journal',
  mission: 'mission',
  quotes: 'quotes',
};

function normalizeDeepLinkPath(url: string): string {
  return url.replace(/^trackit2:\/\//i, '').replace(/\/+$/, '');
}

/** Handles app-specific deep links before React Navigation linking. */
export function handleTrackItDeepLink(url: string): boolean {
  const path = normalizeDeepLinkPath(url);

  if (!path) {
    return false;
  }

  const moduleMatch = path.match(/^module\/([^/?#]+)/i);
  if (moduleMatch?.[1]) {
    const moduleId = PROFILE_MODULE_PATHS[moduleMatch[1].toLowerCase()];
    if (moduleId) {
      useProfileModuleStore.getState().openModule(moduleId);
      return true;
    }
  }

  if (path === 'habits') {
    useProfileModuleStore.getState().openModule('habits');
    return true;
  }

  if (path === 'planner' || path === 'planner/today') {
    navigateTab('Planner');
    return true;
  }

  if (path === 'planner/tasks' || path.startsWith('planner/task/')) {
    navigateTab('Planner');
    usePlannerNavigationStore.getState().openAllTasks();
    return true;
  }

  if (path === 'health/workout/start') {
    navigateTab('Health');
    useHealthStore.getState().openWorkoutGoalPicker();
    return true;
  }

  if (path === 'health/workout' || path === 'workout') {
    navigateTab('Health');
    useHealthHubNavigationStore.getState().queueRoute({ screen: 'WorkoutDetails' });
    return true;
  }

  if (path === 'health/food-search') {
    navigateTab('Health');
    useHealthHubNavigationStore.getState().queueRoute({ screen: 'FoodSearch' });
    return true;
  }

  if (path === 'health') {
    navigateTab('Health');
    return true;
  }

  if (path === 'dashboard') {
    navigateTab('Dashboard');
    return true;
  }

  if (path === 'analytics') {
    navigateTab('Analytics');
    return true;
  }

  if (path === 'health/workout-details') {
    navigateTab('Health');
    navigateHealthScreen('WorkoutDetails');
    return true;
  }

  return false;
}
