import { getHealthTheme, type HealthThemeTokens } from '../components/health/ui/healthTheme';
import { useTheme } from '../theme/ThemeContext';

export function useHealthTheme(): HealthThemeTokens {
  const { isDark } = useTheme();
  return getHealthTheme(isDark);
}
