import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  getDeviceLocale,
  i18n,
  initI18n,
  resolveLocale,
  type AppLocale,
  type LocalePreference,
} from '../i18n';
import { isAppLocale } from '../i18n/types';

const STORAGE_KEY = '@trackit/locale_preference';

type LocaleState = {
  preference: LocalePreference;
  resolved: AppLocale;
  isReady: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: LocalePreference) => Promise<void>;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  preference: 'system',
  resolved: getDeviceLocale(),
  isReady: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const preference: LocalePreference =
        raw === 'system' || (raw != null && isAppLocale(raw)) ? (raw as LocalePreference) : 'system';
      const resolved = resolveLocale(preference);
      initI18n(preference);
      set({ preference, resolved, isReady: true });
    } catch {
      initI18n('system');
      set({ preference: 'system', resolved: getDeviceLocale(), isReady: true });
    }
  },

  setPreference: async (preference) => {
    const resolved = resolveLocale(preference);
    initI18n(preference);
    if (i18n.language !== resolved) {
      await i18n.changeLanguage(resolved);
    }
    set({ preference, resolved });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, preference);
    } catch (error) {
      console.warn('[Locale] failed to persist preference:', error);
    }
  },
}));
