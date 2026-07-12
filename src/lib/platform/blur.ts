import { SUPPORTS_NATIVE_BLUR } from './constants';

/** Whether expo-blur BlurView can be rendered on the current platform. */
export function supportsNativeBlur(): boolean {
  return SUPPORTS_NATIVE_BLUR;
}

/** Frosted card background when native blur is unavailable (Android, web, TMA). */
export function frostedOverlayColor(isDark: boolean): string {
  return isDark ? 'rgba(16, 14, 28, 0.88)' : 'rgba(255, 255, 255, 0.78)';
}
