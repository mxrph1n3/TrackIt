import { IS_WEB } from '../lib/platform/constants';
import {
  getTelegramColorScheme,
  isTelegramMiniApp,
} from '../lib/telegram/telegramWebApp';
import { ETHEREAL_AMBIENT, getWebHostBackgroundCss, OBSIDIAN_AMBIENT } from './ambientBackground';
import type { AppThemeMode } from './themes';
import { isEffectiveDarkMode, OBSIDIAN_CANVAS } from './resolveWebBackground';

function paintHostLayer(node: HTMLElement | null | undefined, cssBackground: string) {
  if (!node) {
    return;
  }

  const parts = cssBackground.split(';').filter(Boolean);
  for (const part of parts) {
    const [property, ...valueParts] = part.split(':');
    if (!property || valueParts.length === 0) {
      continue;
    }
    node.style.setProperty(property.trim(), valueParts.join(':').trim(), 'important');
  }
}

/** Keeps html/body/#root aligned with ScreenAmbientBackground (RN Web bleeds through host layers). */
export function syncWebDocumentTheme(_background: string, mode: AppThemeMode): void {
  if (!IS_WEB || typeof document === 'undefined') {
    return;
  }

  const effectiveDark = isEffectiveDarkMode(mode);
  const ambientBase = effectiveDark ? OBSIDIAN_AMBIENT.baseColor : ETHEREAL_AMBIENT.baseColor;
  const hostBackgroundCss = getWebHostBackgroundCss(effectiveDark);
  const root = document.documentElement;

  root.dataset.theme = mode;
  root.dataset.effectiveDark = effectiveDark ? 'true' : 'false';

  if (IS_WEB && isTelegramMiniApp()) {
    const tgScheme = getTelegramColorScheme();
    if (tgScheme) {
      root.dataset.telegramTheme = tgScheme;
    }
  }

  if (effectiveDark) {
    root.style.setProperty('--tg-theme-bg-color', OBSIDIAN_CANVAS);
    root.style.setProperty('--tg-theme-secondary-bg-color', OBSIDIAN_CANVAS);
  } else if (IS_WEB && isTelegramMiniApp()) {
    root.style.setProperty('--tg-theme-bg-color', ETHEREAL_AMBIENT.baseColor);
    root.style.setProperty('--tg-theme-secondary-bg-color', ETHEREAL_AMBIENT.baseColor);
  }

  paintHostLayer(root, hostBackgroundCss);
  paintHostLayer(document.body, hostBackgroundCss);
  paintHostLayer(document.getElementById('root'), hostBackgroundCss);

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ambientBase);
}
