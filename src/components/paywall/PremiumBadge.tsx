import { Crown } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

type PremiumBadgeProps = {
  label?: string;
  onPress?: () => void;
};

export function PremiumBadge({ label = 'PRO', onPress }: PremiumBadgeProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: `${theme.primary}22`,
        borderWidth: 1,
        borderColor: `${theme.primary}55`,
      }}
    >
      <Crown color={theme.primary} size={11} strokeWidth={2.4} />
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 1,
          color: theme.primary,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      {content}
    </Pressable>
  );
}
