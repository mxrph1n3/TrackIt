import { Platform } from 'react-native';

import { SPACING } from './designTokens';

/** Horizontal inset for tab scroll screens — tighter on Android for full-bleed cards. */
export function getScreenHorizontalPadding(): number {
  return Platform.OS === 'android' ? 12 : SPACING.screenGutter;
}
