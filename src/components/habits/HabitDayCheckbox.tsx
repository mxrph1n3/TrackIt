import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { useTheme } from '../../theme/ThemeContext';
import { toggleSpring } from '../../theme/motion';

type HabitDayCheckboxProps = {
  completed: boolean;
  isToday: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function HabitDayCheckbox({
  completed,
  isToday,
  disabled,
  onToggle,
}: HabitDayCheckboxProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(completed ? 1 : 0.92);

  useEffect(() => {
    scale.value = withSpring(completed ? 1 : 0.92, toggleSpring);
  }, [completed, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onToggle} disabled={disabled} className="items-center active:opacity-85">
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 28,
            height: 28,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: completed ? theme.primary : `${theme.primary}55`,
            backgroundColor: completed ? theme.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: completed ? theme.primaryNeon : 'transparent',
            shadowOpacity: completed ? 0.35 : 0,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
          },
          isToday && !completed
            ? { borderColor: theme.primary, borderWidth: 2 }
            : null,
        ]}
      >
        {completed ? <Check color={theme.textPrimary} size={14} strokeWidth={3} /> : null}
      </Animated.View>
    </Pressable>
  );
}
