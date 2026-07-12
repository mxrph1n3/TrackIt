import type { HealthThemeTokens } from '../components/health/ui/healthTheme';
import { getHealthTheme } from '../components/health/ui/healthTheme';
import { useHealthIsDark } from './useHealthIsDark';

export function useHealthTheme(): HealthThemeTokens {
  return getHealthTheme(useHealthIsDark());
}
