import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DailyProgressScreen } from '../screens/health/DailyProgressScreen';
import { ExerciseDetailsScreen } from '../screens/health/ExerciseDetailsScreen';
import { FoodSearchScreen } from '../screens/health/FoodSearchScreen';
import { MealDetailsScreen } from '../screens/health/MealDetailsScreen';
import { WorkoutDetailsScreen } from '../screens/health/WorkoutDetailsScreen';
import { HealthHubScreen } from '../screens/HealthHubScreen';
import type { HealthStackParamList } from './healthTypes';

const Stack = createNativeStackNavigator<HealthStackParamList>();

export function HealthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Hub" component={HealthHubScreen} />
      <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
      <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
      <Stack.Screen name="MealDetails" component={MealDetailsScreen} />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
      <Stack.Screen name="DailyProgress" component={DailyProgressScreen} />
    </Stack.Navigator>
  );
}
