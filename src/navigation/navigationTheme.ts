import {
  DarkTheme,
  DefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import { useMemo } from 'react';

import { useTheme } from '../theme/ThemeContext';
import { isEffectiveDarkMode, resolveWebSceneBackground } from '../theme/resolveWebBackground';

/** React Navigation paints its own card/scene background on web — sync with app theme. */
export function useAppNavigationTheme(): NavigationTheme {
  const { theme, mode } = useTheme();
  const canvas = resolveWebSceneBackground(theme.background, mode);
  const dark = isEffectiveDarkMode(mode);

  return useMemo(() => {
    const base = dark ? DarkTheme : DefaultTheme;

    return {
      ...base,
      dark,
      colors: {
        ...base.colors,
        primary: theme.primary,
        background: canvas,
        card: canvas,
        text: dark ? '#F8FAFC' : theme.textPrimary,
        border: theme.border,
        notification: theme.primary,
      },
    };
  }, [canvas, dark, theme]);
}
