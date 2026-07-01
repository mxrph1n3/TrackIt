import type { ImageSourcePropType } from 'react-native';

import { getDefaultAvatarImage } from './themeAssets';
import { useTheme } from '../theme/ThemeContext';

/** Canonical local profile photo — used by `UserAvatar` across the app. */
export const DEFAULT_AVATAR: ImageSourcePropType = require('../assets/images/default_avatar.png');

/** @deprecated Prefer `DEFAULT_AVATAR` via `UserAvatar` for standardized rendering. */
export function resolveUserAvatar(onboardingAvatarUrl?: string | null): ImageSourcePropType {
  if (onboardingAvatarUrl) {
    return { uri: onboardingAvatarUrl };
  }
  return DEFAULT_AVATAR;
}

export function useDefaultAvatarSource(): ImageSourcePropType {
  const { mode } = useTheme();
  return getDefaultAvatarImage(mode);
}
