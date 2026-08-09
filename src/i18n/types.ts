export const APP_LOCALES = ['en', 'ru', 'es', 'de'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

/** User preference: follow OS or lock to a language. */
export type LocalePreference = 'system' | AppLocale;

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  ru: 'Русский',
  es: 'Español',
  de: 'Deutsch',
};

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}
