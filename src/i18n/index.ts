import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de';
import en from './locales/en';
import es from './locales/es';
import ru from './locales/ru';
import { isAppLocale, type AppLocale, type LocalePreference } from './types';

export const i18nResources = {
  en: { translation: en },
  ru: { translation: ru },
  es: { translation: es },
  de: { translation: de },
} as const;

export function getDeviceLocale(): AppLocale {
  const code = Localization.getLocales()[0]?.languageCode?.toLowerCase() ?? 'en';
  if (isAppLocale(code)) {
    return code;
  }
  return 'en';
}

export function resolveLocale(preference: LocalePreference): AppLocale {
  if (preference === 'system') {
    return getDeviceLocale();
  }
  return preference;
}

let initialized = false;

export function initI18n(preference: LocalePreference = 'system'): typeof i18n {
  const lng = resolveLocale(preference);

  if (!initialized) {
    void i18n.use(initReactI18next).init({
      resources: i18nResources,
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
      react: { useSuspense: false },
    });
    initialized = true;
  } else if (i18n.language !== lng) {
    void i18n.changeLanguage(lng);
  }

  return i18n;
}

export { i18n };
export type { AppLocale, LocalePreference } from './types';
export { APP_LOCALES, LOCALE_LABELS, isAppLocale } from './types';

/** Eager default so first paint has translations before AsyncStorage hydrate. */
initI18n('system');
