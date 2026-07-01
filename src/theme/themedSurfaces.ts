import type { AppTheme } from './themes';

/** Shared translucent surfaces that adapt to ethereal vs obsidian. */
export function getThemedSurfaces(theme: AppTheme, isDark: boolean) {
  return {
    chip: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.52)',
    chipStrong: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.72)',
    inset: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.82)',
    empty: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.35)',
    progressTrack: isDark ? 'rgba(119, 93, 216, 0.22)' : 'rgba(255, 255, 255, 0.55)',
    divider: isDark ? 'rgba(119, 93, 216, 0.18)' : 'rgba(119, 93, 216, 0.08)',
    openButton: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.55)',
    dashedBorder: isDark ? 'rgba(119, 93, 216, 0.28)' : 'rgba(119, 93, 216, 0.18)',
    cardShell: theme.cardFrosted,
    border: theme.borderSubtle,
    onPrimary: isDark ? '#F8FAFC' : '#1E1A3E',
  } as const;
}
