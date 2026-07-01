import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  ETHEREAL_THEME,
  getThemeForMode,
  THEME_STORAGE_KEY,
  type AppTheme,
  type AppThemeMode,
} from './themes';
import { syncAppIconWithTheme } from '../lib/appIcon/syncAppIconWithTheme';

type ThemeContextValue = {
  theme: AppTheme;
  mode: AppThemeMode;
  isDark: boolean;
  isReady: boolean;
  setMode: (mode: AppThemeMode) => void;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<AppThemeMode>('ethereal');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (!mounted) {
        return;
      }

      if (stored === 'ethereal' || stored === 'obsidian') {
        setModeState(stored);
      }

      setIsReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void syncAppIconWithTheme(mode);
  }, [isReady, mode]);

  const setMode = useCallback((next: AppThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setMode(mode === 'ethereal' ? 'obsidian' : 'ethereal');
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getThemeForMode(mode),
      mode,
      isDark: mode === 'obsidian',
      isReady,
      setMode,
      toggleDarkMode,
    }),
    [isReady, mode, setMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: ETHEREAL_THEME,
      mode: 'ethereal',
      isDark: false,
      isReady: true,
      setMode: () => {},
      toggleDarkMode: () => {},
    };
  }

  return ctx;
}
