import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ObsidianTheme } from '../../theme/obsidian';

type ScheduleCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  accessibilityLabel: string;
};

export function ScheduleCheckbox({
  checked,
  indeterminate = false,
  onToggle,
  accessibilityLabel,
}: ScheduleCheckboxProps) {
  const { surfaces, isDark } = useThemedStyles();
  const isActive = checked || indeterminate;
  const onGradient = surfaces.onPrimary;

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: checked || indeterminate }}
      accessibilityLabel={accessibilityLabel}
      className="active:opacity-75"
      hitSlop={8}
    >
      {isActive ? (
        <LinearGradient
          colors={
            indeterminate && !checked
              ? ['#94A3B8', '#CBD5E1', '#94A3B8']
              : [ObsidianTheme.primary, ObsidianTheme.primaryNeon, '#6366F1']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: indeterminate && !checked ? '#94A3B8' : ObsidianTheme.primaryNeon,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: indeterminate && !checked ? 0.35 : 0.65,
            shadowRadius: 10,
          }}
        >
          {indeterminate && !checked ? (
            <View
              style={{
                width: 10,
                height: 2,
                borderRadius: 1,
                backgroundColor: onGradient,
              }}
            />
          ) : (
            <Check color={onGradient} size={14} strokeWidth={3} />
          )}
        </LinearGradient>
      ) : (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            backgroundColor: isDark ? surfaces.chip : 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(149, 128, 232, 0.55)' : 'rgba(139, 92, 246, 0.45)',
          }}
        />
      )}
    </Pressable>
  );
}
