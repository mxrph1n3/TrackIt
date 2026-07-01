import Constants from 'expo-constants';
import { Appearance, Platform } from 'react-native';

import type { AppThemeMode } from '../../theme/themes';

/** Alternate icon id registered in app.json → obsidian (dark). Default icon = ethereal (light). */
const OBSIDIAN_ICON_NAME = 'obsidian' as const;

export async function syncAppIconWithTheme(mode: AppThemeMode): Promise<void> {
  const colorScheme = mode === 'obsidian' ? 'dark' : 'light';
  Appearance.setColorScheme(colorScheme);

  if (Platform.OS === 'web' || Constants.appOwnership === 'expo') {
    return;
  }

  try {
    const { setAppIcon } = await import('@g9k/expo-dynamic-app-icon');
    const iconName = mode === 'obsidian' ? OBSIDIAN_ICON_NAME : null;
    setAppIcon(iconName, true);
  } catch (error) {
    console.warn('[AppIcon] Could not sync launcher icon with theme:', error);
  }
}
