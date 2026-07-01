import { Menu } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

type MenuHeaderButtonProps = {
  onPress?: () => void;
  size?: number;
  accessibilityLabel?: string;
};

export function MenuHeaderButton({
  onPress,
  size = 22,
  accessibilityLabel = 'Open menu',
}: MenuHeaderButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-10 w-10 items-center justify-center active:opacity-70"
    >
      <Menu color={theme.textPrimary} size={size} strokeWidth={1.5} />
    </Pressable>
  );
}
