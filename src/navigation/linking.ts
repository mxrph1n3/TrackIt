import type { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';

import { handleTrackItDeepLink } from '../lib/navigation/deepLinkRouter';
import { IS_WEB } from '../lib/platform/constants';
import type { RootTabParamList } from './types';

function getLinkingPrefixes(): string[] {
  const prefixes = ['trackit2://'];

  if (IS_WEB && typeof window !== 'undefined') {
    prefixes.push(window.location.origin);
  }

  const configured = process.env.EXPO_PUBLIC_WEB_APP_URL?.replace(/\/$/, '');
  if (configured && !prefixes.includes(configured)) {
    prefixes.push(configured);
  }

  return prefixes;
}

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: getLinkingPrefixes(),
  config: {
    screens: {
      Dashboard: 'dashboard',
      Planner: 'planner',
      Health: {
        path: 'health',
        screens: {
          Hub: '',
          FoodSearch: 'food-search',
          WorkoutDetails: 'workout',
          MealDetails: 'meal/:mealSlot',
          ExerciseDetails: 'exercise/:exerciseIndex',
          DailyProgress: 'progress',
        },
      },
      Analytics: 'analytics',
    },
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => {
      if (!handleTrackItDeepLink(url)) {
        listener(url);
      }
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => subscription.remove();
  },
};
