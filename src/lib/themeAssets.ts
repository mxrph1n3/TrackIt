import type { ImageSourcePropType } from 'react-native';

import type { AppThemeMode } from '../theme/themes';

const WORKOUT_ACHIEVE = {
  ethereal: require('../../assets/images/achieve.png'),
  obsidian: require('../../assets/images/achive_dark.png'),
} as const;

const WELCOME_GATE = {
  ethereal: require('../../assets/images/welcome-gate.png'),
  obsidian: require('../../assets/images/welcome-gate-dark.png'),
} as const;

const CRYSTAL = {
  ethereal: require('../../crystall.png'),
  obsidian: require('../../crystall-dark.png'),
} as const;

const WORKOUT_HERO = {
  ethereal: require('../assets/images/workout_hero_bg.png'),
  obsidian: require('../assets/images/workout_hero_bg_dark.png'),
} as const;

const TODAY_WIDGET = {
  ethereal: require('../assets/images/today_widget_bg.png'),
  obsidian: require('../assets/images/today_widget_bg_dark.png'),
} as const;

const NUTRITION_WIDGET = {
  ethereal: require('../assets/images/nutrition_widget_bg.png'),
  obsidian: require('../assets/images/nutrition_widget_bg_dark.png'),
} as const;

export type ImageScrimPreset = 'horizontal' | 'horizontalSoft' | 'vertical' | 'focusCard';

const IMAGE_SCRIMS: Record<AppThemeMode, Record<ImageScrimPreset, readonly [string, string, ...string[]]>> = {
  ethereal: {
    horizontal: [
      'rgba(247, 248, 252, 0.94)',
      'rgba(247, 248, 252, 0.82)',
      'rgba(247, 248, 252, 0.45)',
      'rgba(247, 248, 252, 0.12)',
    ],
    horizontalSoft: [
      'rgba(247, 248, 252, 0.94)',
      'rgba(247, 248, 252, 0.82)',
      'rgba(247, 248, 252, 0.55)',
    ],
    vertical: [
      'rgba(247, 248, 252, 0.96)',
      'rgba(247, 248, 252, 0.78)',
      'rgba(247, 248, 252, 0.12)',
      'rgba(247, 248, 252, 0)',
    ],
    focusCard: [
      'rgba(250, 250, 252, 0.96)',
      'rgba(250, 250, 252, 0.82)',
      'rgba(250, 250, 252, 0.35)',
      'rgba(250, 250, 252, 0.08)',
    ],
  },
  obsidian: {
    horizontal: [
      'rgba(7, 7, 10, 0.94)',
      'rgba(12, 12, 20, 0.86)',
      'rgba(18, 18, 28, 0.52)',
      'rgba(7, 7, 10, 0.16)',
    ],
    horizontalSoft: [
      'rgba(7, 7, 10, 0.92)',
      'rgba(15, 15, 25, 0.84)',
      'rgba(18, 18, 28, 0.58)',
    ],
    vertical: [
      'rgba(7, 7, 10, 0.96)',
      'rgba(15, 15, 25, 0.82)',
      'rgba(18, 18, 28, 0.22)',
      'rgba(7, 7, 10, 0)',
    ],
    focusCard: [
      'rgba(7, 7, 10, 0.9)',
      'rgba(12, 12, 20, 0.58)',
      'rgba(18, 18, 28, 0.18)',
      'rgba(7, 7, 10, 0)',
    ],
  },
};

export function getWorkoutAchieveImage(mode: AppThemeMode): ImageSourcePropType {
  return WORKOUT_ACHIEVE[mode];
}

export function getWelcomeGateImage(mode: AppThemeMode): ImageSourcePropType {
  return WELCOME_GATE[mode];
}

export function getCrystalImage(mode: AppThemeMode): ImageSourcePropType {
  return CRYSTAL[mode];
}

export function getWorkoutHeroImage(mode: AppThemeMode): ImageSourcePropType {
  return WORKOUT_HERO[mode];
}

export function getTodayWidgetImage(mode: AppThemeMode): ImageSourcePropType {
  return TODAY_WIDGET[mode];
}

export function getNutritionWidgetImage(mode: AppThemeMode): ImageSourcePropType {
  return NUTRITION_WIDGET[mode];
}

const DEFAULT_AVATAR = {
  ethereal: require('../assets/images/default_avatar.png'),
  obsidian: require('../assets/images/default_avatar_dark.png'),
} as const;

export function getDefaultAvatarImage(mode: AppThemeMode): ImageSourcePropType {
  return DEFAULT_AVATAR[mode];
}

export function getImageScrim(mode: AppThemeMode, preset: ImageScrimPreset) {
  return IMAGE_SCRIMS[mode][preset];
}
