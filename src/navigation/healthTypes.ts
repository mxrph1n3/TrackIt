import type { MealSlot } from '../types/health';

export type HealthStackParamList = {
  Hub: undefined;
  WorkoutDetails: undefined;
  ExerciseDetails: { exerciseIndex: number };
  MealDetails: { mealSlot?: MealSlot; mealId?: string };
  FoodSearch: { targetSlot?: MealSlot };
  DailyProgress: undefined;
};

export type HealthStackScreen = keyof HealthStackParamList;

export type HealthPendingRoute = {
  screen: Exclude<HealthStackScreen, 'Hub'>;
  params?: HealthStackParamList[Exclude<HealthStackScreen, 'Hub'>];
};
