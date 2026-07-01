import { SlidersHorizontal } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import { MenuHeaderButton } from '../navigation/MenuHeaderButton';

type DashboardHeaderProps = {
  onMenuPress: () => void;
  onFilterPress: () => void;
};

export function DashboardHeader({ onMenuPress, onFilterPress }: DashboardHeaderProps) {
  const { theme } = useTheme();

  return (
    <View className="mb-[22px] flex-row items-center justify-between">
      <MenuHeaderButton onPress={onMenuPress} />

      <Text className="text-[11px] font-bold uppercase tracking-[0.35em] text-ethereal-ink">
        Dashboard
      </Text>

      <Pressable
        onPress={onFilterPress}
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        className="h-10 w-10 items-center justify-center active:opacity-70"
      >
        <SlidersHorizontal color={theme.textPrimary} size={20} strokeWidth={1.5} />
      </Pressable>
    </View>
  );
}
