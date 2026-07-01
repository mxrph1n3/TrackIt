import { vars } from 'nativewind';

import type { AppTheme } from './themes';

function hexToRgbChannels(hex: string): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function colorToRgbChannels(color: string): string {
  if (color.startsWith('#')) {
    return hexToRgbChannels(color);
  }

  const rgbaMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbaMatch) {
    return `${rgbaMatch[1]} ${rgbaMatch[2]} ${rgbaMatch[3]}`;
  }

  return '30 26 62';
}

export function themeNativeWindVars(theme: AppTheme) {
  return vars({
    '--ethereal-ink': colorToRgbChannels(theme.textPrimary),
    '--ethereal-slate': colorToRgbChannels(theme.textSecondary),
    '--ethereal-muted': colorToRgbChannels(theme.textMuted),
    '--ethereal-kicker': colorToRgbChannels(theme.textSecondary),
    '--ethereal-glass': theme.card,
    '--ethereal-glass-border': theme.border,
    '--ethereal-base': theme.background,
    '--ethereal-mist': theme.background,
  });
}
