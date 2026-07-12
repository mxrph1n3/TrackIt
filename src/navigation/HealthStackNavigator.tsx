import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { useHealthTheme } from '../hooks/useHealthTheme';
import { useTheme } from '../theme/ThemeContext';
import { resolveWebSceneBackground } from '../theme/resolveWebBackground';
import { DailyProgressScreen } from '../screens/health/DailyProgressScreen';
import { ExerciseDetailsScreen } from '../screens/health/ExerciseDetailsScreen';
import { FoodSearchScreen } from '../screens/health/FoodSearchScreen';
import { MealDetailsScreen } from '../screens/health/MealDetailsScreen';
import { WorkoutDetailsScreen } from '../screens/health/WorkoutDetailsScreen';
import { HealthHubScreen } from '../screens/HealthHubScreen';
import type { HealthStackParamList } from './healthTypes';

const Stack = createNativeStackNavigator<HealthStackParamList>();

export function HealthStackNavigator() {
  const { mode } = useTheme();
  const healthTheme = useHealthTheme();
  const canvas = resolveWebSceneBackground(healthTheme.canvas, mode);

  return (
    <View style={[styles.root, { backgroundColor: canvas }]}>
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: canvas, zIndex: 0 }]}
      />
      <View style={styles.navigator}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: canvas },
          }}
        >
        <Stack.Screen name="Hub" component={HealthHubScreen} />
        <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
        <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
        <Stack.Screen name="MealDetails" component={MealDetailsScreen} />
        <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
        <Stack.Screen name="DailyProgress" component={DailyProgressScreen} />
      </Stack.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  navigator: {
    flex: 1,
    zIndex: 1,
  },
});
