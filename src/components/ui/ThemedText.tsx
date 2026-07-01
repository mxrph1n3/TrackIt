import type { TextProps, TextStyle } from 'react-native';
import { Text } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

type ThemedTextVariant = 'primary' | 'secondary' | 'muted' | 'primaryOnBrand';

type ThemedTextProps = TextProps & {
  variant?: ThemedTextVariant;
};

export function ThemedText({ variant = 'primary', style, ...props }: ThemedTextProps) {
  const { theme, isDark } = useTheme();

  let color: string = theme.textPrimary;
  if (variant === 'secondary') color = theme.textSecondary;
  if (variant === 'muted') color = theme.textMuted;
  if (variant === 'primaryOnBrand') color = isDark ? '#F8FAFC' : '#1E1A3E';

  return <Text style={[{ color }, style as TextStyle]} {...props} />;
}
