import { IS_WEB } from '../lib/platform/constants';
import { getTelegramColorScheme, isTelegramMiniApp } from '../lib/telegram/telegramWebApp';
import type { AppThemeMode } from './themes';

export const OBSIDIAN_CANVAS = '#07070A';

/** Web/TMA canvas color — Obsidian app theme or Telegram dark chrome. */
export function resolveWebBackground(background: string, mode: AppThemeMode): string {
  if (mode === 'obsidian') {
    return OBSIDIAN_CANVAS;
  }

  if (IS_WEB && isTelegramMiniApp() && getTelegramColorScheme() === 'dark') {
    return OBSIDIAN_CANVAS;
  }

  return background;
}

export function isEffectiveDarkMode(mode: AppThemeMode): boolean {
  if (mode === 'obsidian') {
    return true;
  }

  return IS_WEB && isTelegramMiniApp() && getTelegramColorScheme() === 'dark';
}

/** Tab/stack scenes stay transparent in dark mode so ScreenAmbientBackground shows through (Dashboard). */
export function resolveWebSceneBackground(background: string, mode: AppThemeMode): string {
  if (isEffectiveDarkMode(mode)) {
    return 'transparent';
  }

  return background;
}
