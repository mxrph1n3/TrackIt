import type { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';

import { handleTrackItDeepLink } from '../lib/navigation/deepLinkRouter';
import type { RootTabParamList } from './types';

export const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['trackit2://'],
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
