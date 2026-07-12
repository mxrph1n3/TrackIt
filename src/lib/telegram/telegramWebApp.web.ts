import WebApp from '@twa-dev/sdk';

export type TelegramSafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type TelegramWebAppLike = typeof WebApp;
type ChromeListener = () => void;

const THEME_PARAM_KEYS = [
  'bg_color',
  'text_color',
  'hint_color',
  'link_color',
  'button_color',
  'button_text_color',
  'secondary_bg_color',
  'header_bg_color',
  'accent_text_color',
  'section_bg_color',
  'section_header_text_color',
  'subtitle_text_color',
  'destructive_text_color',
] as const;

let tmaDetected = false;
let tmaInitialized = false;
let eventsRegistered = false;
let chromeVersion = 0;
const chromeListeners = new Set<ChromeListener>();

function notifyChromeListeners() {
  chromeVersion += 1;
  chromeListeners.forEach((listener) => listener());
}

function registerTelegramEvents() {
  if (eventsRegistered || !tmaDetected) {
    return;
  }

  eventsRegistered = true;

  WebApp.onEvent('themeChanged', () => {
    applyTelegramThemeToDocument();
    notifyChromeListeners();
  });
  WebApp.onEvent('viewportChanged', notifyChromeListeners);
  WebApp.onEvent('safeAreaChanged', notifyChromeListeners);
}

/** Subscribe to Telegram viewport / safe-area / theme chrome updates. */
export function subscribeTelegramChrome(listener: ChromeListener): () => void {
  chromeListeners.add(listener);
  return () => {
    chromeListeners.delete(listener);
  };
}

export function getTelegramChromeVersion(): number {
  return chromeVersion;
}

/** Maps Telegram themeParams to CSS variables on `document.documentElement`. */
export function applyTelegramThemeToDocument(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const scheme = WebApp.colorScheme;
  if (scheme) {
    root.dataset.telegramTheme = scheme;
  }

  const params = WebApp.themeParams ?? {};
  for (const key of THEME_PARAM_KEYS) {
    const value = params[key];
    if (value) {
      root.style.setProperty(`--tg-theme-${key.replace(/_/g, '-')}`, value);
    }
  }

  const themeColor = params.bg_color;
  if (themeColor) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }
}

export function getTelegramWebApp(): TelegramWebAppLike | null {
  return WebApp;
}

export function isTelegramMiniApp(): boolean {
  if (tmaDetected) {
    return true;
  }
  tmaDetected = Boolean(WebApp.initData || WebApp.platform);
  return tmaDetected;
}

export function initTelegramWebApp(): TelegramWebAppLike | null {
  if (tmaInitialized) {
    return getTelegramWebApp();
  }

  tmaInitialized = true;
  tmaDetected = Boolean(WebApp.initData || WebApp.platform);

  if (!tmaDetected) {
    return null;
  }

  try {
    WebApp.ready();
    WebApp.expand();
    applyTelegramThemeToDocument();
    registerTelegramEvents();
  } catch (error) {
    console.warn('[Telegram] WebApp init failed:', error);
  }

  return WebApp;
}

export function getTelegramSafeAreaInsets(): TelegramSafeAreaInsets | null {
  const inset = WebApp.contentSafeAreaInset ?? WebApp.safeAreaInset;
  if (!inset) {
    return null;
  }
  return {
    top: inset.top ?? 0,
    bottom: inset.bottom ?? 0,
    left: inset.left ?? 0,
    right: inset.right ?? 0,
  };
}

export function getTelegramColorScheme(): 'light' | 'dark' | null {
  return WebApp.colorScheme ?? null;
}

export function getTelegramUser() {
  return WebApp.initDataUnsafe?.user ?? null;
}
