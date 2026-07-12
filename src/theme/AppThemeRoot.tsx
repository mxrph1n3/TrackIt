import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { useTelegramThemeSync } from '../hooks/useTelegramThemeSync';
import { IS_WEB } from '../lib/platform/constants';
import { subscribeTelegramChrome } from '../lib/telegram/telegramWebApp';
import { themeNativeWindVars } from './nativewindVars';
import { isEffectiveDarkMode, resolveWebBackground } from './resolveWebBackground';
import { syncWebDocumentTheme } from './syncWebDocumentTheme';
import { OBSIDIAN_DARK_THEME } from './themes';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemedStatusBar() {
  const { theme, mode } = useTheme();
  const style = isEffectiveDarkMode(mode) ? 'light' : theme.statusBarStyle;
  return <StatusBar style={style} />;
}

function ThemedAppShell({ children }: PropsWithChildren) {
  const { theme, mode } = useTheme();
  const [telegramChromeTick, setTelegramChromeTick] = useState(0);
  useTelegramThemeSync();

  useEffect(() => {
    if (!IS_WEB) {
      return;
    }

    return subscribeTelegramChrome(() => {
      setTelegramChromeTick((value) => value + 1);
    });
  }, []);

  const shellBackground =
    IS_WEB && isEffectiveDarkMode(mode)
      ? 'transparent'
      : resolveWebBackground(theme.background, mode);
  const shellTheme = isEffectiveDarkMode(mode) ? OBSIDIAN_DARK_THEME : theme;

  useEffect(() => {
    syncWebDocumentTheme(theme.background, mode);
  }, [mode, theme.background, telegramChromeTick]);

  return (
    <View
      style={[
        { flex: 1, backgroundColor: shellBackground },
        themeNativeWindVars(shellTheme),
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
