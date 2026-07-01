import type { QuickActionId } from '../../types/quickActions';
import { navigateHealthScreen, navigateTab } from '../../navigation/navigationRef';
import { useCreateHubStore } from '../../stores/useCreateHubStore';
import { useHealthHubNavigationStore } from '../../stores/useHealthHubNavigationStore';
import { useHealthStore } from '../../stores/useHealthStore';
import { usePlannerNavigationStore } from '../../stores/usePlannerNavigationStore';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';

export function routeExternalQuickAction(actionId: QuickActionId, onClose: () => void): boolean {
  switch (actionId) {
    case 'workout': {
      onClose();
      useHealthStore.getState().openWorkoutGoalPicker();
      return true;
    }
    case 'focus': {
      onClose();
      useProfileModuleStore.getState().openModule('focus');
      return true;
    }
    case 'goal':
    case 'savings-goal': {
      onClose();
      useProfileModuleStore.getState().openModule('finance');
      return true;
    }
    case 'mood': {
      onClose();
      useCreateHubStore.getState().open('mood');
      return true;
    }
    case 'event': {
      onClose();
      usePlannerNavigationStore.getState().openTaskCreator({ time: '' });
      navigateTab('Planner');
      return true;
    }
    case 'scan': {
      onClose();
      useHealthHubNavigationStore.getState().queueRoute({ screen: 'FoodSearch' });
      navigateTab('Health');
      return true;
    }
    default:
      return false;
  }
}
