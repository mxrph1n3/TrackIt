import type { AppThemeMode } from './themes';

/** Shared ambient canvas tokens — used by ScreenAmbientBackground and web host layers. */
export const OBSIDIAN_AMBIENT = {
  gradient: ['#12121C', '#07070A', '#07070A'] as const,
  glow: ['rgba(119, 93, 216, 0.12)', 'rgba(7, 7, 10, 0)'] as const,
  glowHeight: 280,
  baseColor: '#07070A',
} as const;

export const ETHEREAL_AMBIENT = {
  gradient: ['#FFFFFF', '#F7F8FC', '#F3F5FA'] as const,
  glow: ['rgba(226, 217, 255, 0.22)', 'rgba(255,255,255,0)'] as const,
  glowHeight: 280,
  baseColor: '#F3F5FA',
} as const;

function buildAmbientBackgroundCss(
  gradient: readonly [string, string, string],
  glow: readonly [string, string],
  glowHeight: number,
  baseColor: string,
): string {
  const baseGradient = `linear-gradient(180deg, ${gradient[0]} 0%, ${gradient[1]} 50%, ${gradient[2]} 100%)`;
  const glowGradient = `linear-gradient(to bottom right, ${glow[0]} 0%, ${glow[1]} 45%)`;

  return [
    `background-color:${baseColor}`,
    `background-image:${glowGradient},${baseGradient}`,
    `background-size:100% ${glowHeight}px,100% 100%`,
    `background-repeat:no-repeat,no-repeat`,
    `background-position:top left,top center`,
  ].join(';');
}

/** CSS background shorthand parts for html/body/#root — matches ScreenAmbientBackground 1:1. */
export function getWebHostBackgroundCss(isDark: boolean): string {
  const ambient = isDark ? OBSIDIAN_AMBIENT : ETHEREAL_AMBIENT;
  return buildAmbientBackgroundCss(
    ambient.gradient,
    ambient.glow,
    ambient.glowHeight,
    ambient.baseColor,
  );
}

export function getAmbientModeForTheme(mode: AppThemeMode, effectiveDark: boolean): AppThemeMode {
  return effectiveDark ? 'obsidian' : mode;
}
