import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import {
  getNutritionWidgetImage,
  getTodayWidgetImage,
  getWorkoutHeroImage,
} from './themeAssets';

export type HealthAssets = {
  workoutHero: ImageSourcePropType;
  todayWidget: ImageSourcePropType;
  nutritionWidget: ImageSourcePropType;
};

export function useHealthAssets(): HealthAssets {
  const { mode } = useTheme();

  return {
    workoutHero: getWorkoutHeroImage(mode),
    todayWidget: getTodayWidgetImage(mode),
    nutritionWidget: getNutritionWidgetImage(mode),
  };
}

/** @deprecated Prefer `useHealthAssets()` for theme-aware artwork. */
export const WORKOUT_HERO_BG: ImageSourcePropType = getWorkoutHeroImage('ethereal');

/** @deprecated Prefer `useHealthAssets()` for theme-aware artwork. */
export const TODAY_WIDGET_BG: ImageSourcePropType = getTodayWidgetImage('ethereal');

/** @deprecated Prefer `useHealthAssets()` for theme-aware artwork. */
export const NUTRITION_WIDGET_BG: ImageSourcePropType = getNutritionWidgetImage('ethereal');

function resolveAspectRatio(source: ImageSourcePropType): number {
  const asset = Image.resolveAssetSource(source);
  if (!asset.width || !asset.height) return 16 / 9;
  return asset.width / asset.height;
}

export const TODAY_WIDGET_ASPECT = resolveAspectRatio(TODAY_WIDGET_BG);
export const NUTRITION_WIDGET_ASPECT = resolveAspectRatio(NUTRITION_WIDGET_BG);
