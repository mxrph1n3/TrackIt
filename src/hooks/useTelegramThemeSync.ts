import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

import { IS_WEB } from '../lib/platform/constants';
import {
  applyTelegramThemeToDocument,
  getTelegramColorScheme,
  initTelegramWebApp,
  isTelegramMiniApp,
  subscribeTelegramChrome,
} from '../lib/telegram/telegramWebApp';
import { useTheme } from '../theme/ThemeContext';
import { syncWebDocumentTheme } from '../theme/syncWebDocumentTheme';
import { THEME_STORAGE_KEY, type AppThemeMode } from '../theme/themes';

function schemeToMode(scheme: 'light' | 'dark'): AppThemeMode {
  return scheme === 'dark' ? 'obsidian' : 'ethereal';
}

async function hasStoredThemePreference(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'ethereal' || stored === 'obsidian';
}

/** Syncs obsidian/ethereal with Telegram colorScheme when the user has no saved theme. */
export function useTelegramThemeSync() {
  const { isReady, setMode, mode, theme } = useTheme();

  useEffect(() => {
    if (!IS_WEB || !isReady) {
      return;
    }

    initTelegramWebApp();
    if (!isTelegramMiniApp()) {
      return;
    }

    applyTelegramThemeToDocument();
    syncWebDocumentTheme(theme.background, mode);

    void (async () => {
      if (await hasStoredThemePreference()) {
        return;
      }
      const scheme = getTelegramColorScheme();
      if (scheme) {
        setMode(schemeToMode(scheme));
      }
    })();

    return subscribeTelegramChrome(() => {
      applyTelegramThemeToDocument();
      syncWebDocumentTheme(theme.background, mode);
      void (async () => {
        if (await hasStoredThemePreference()) {
          return;
        }
        const scheme = getTelegramColorScheme();
        if (scheme) {
          setMode(schemeToMode(scheme));
        }
      })();
    });
  }, [isReady, mode, setMode, theme.background]);
}
