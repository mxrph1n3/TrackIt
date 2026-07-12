import type { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { useTelegramThemeSync } from '../hooks/useTelegramThemeSync';
import { themeNativeWindVars } from './nativewindVars';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.statusBarStyle} />;
}

function ThemedAppShell({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  useTelegramThemeSync();

  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.background },
        themeNativeWindVars(theme),
      ]}
    >
      {children}
      <ThemedStatusBar />
    </View>
  );
}

export function AppThemeRoot({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <ThemedAppShell>{children}</ThemedAppShell>
    </ThemeProvider>
  );
}
