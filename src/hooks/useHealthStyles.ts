import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import type { HealthThemeTokens } from '../components/health/ui/healthTheme';
import { useHealthTheme } from './useHealthTheme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useHealthStyles<T extends NamedStyles<T>>(
  factory: (healthTheme: HealthThemeTokens) => T,
): T {
  const healthTheme = useHealthTheme();
  return useMemo(() => StyleSheet.create(factory(healthTheme)), [healthTheme]);
}
