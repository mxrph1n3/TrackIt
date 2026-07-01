import * as Haptics from 'expo-haptics';
import { Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { BRAND } from '../../theme/designTokens';
import { pressInSpring, pressOutSpring } from '../../theme/motion';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AddTaskPillButtonProps = {
  onPress: () => void;
  label?: string;
  fullWidth?: boolean;
  accessibilityLabel?: string;
};

export function AddTaskPillButton({
  onPress,
  label = 'Add task',
  fullWidth = false,
  accessibilityLabel,
}: AddTaskPillButtonProps) {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const scale = useSharedValue(1);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pill: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: 196,
          height: 50,
          paddingLeft: 20,
          paddingRight: 6,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.chip,
          ...Platform.select({
            ios: {
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme.shadowOpacity,
              shadowRadius: 12,
            },
            android: { elevation: 2 },
          }),
        },
        pillFull: {
          alignSelf: 'stretch',
          width: '100%',
          minWidth: undefined,
        },
        label: {
          flexShrink: 1,
          marginRight: 12,
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 0.6,
          color: theme.textMuted,
          textTransform: 'uppercase',
        },
        bullet: {
          width: 38,
          height: 38,
          borderRadius: 19,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.primary,
          shadowColor: BRAND.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.26,
          shadowRadius: 10,
          elevation: 4,
        },
      }),
    [surfaces.chip, theme],
  );

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97, pressInSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressOutSpring);
      }}
      style={[styles.pill, fullWidth && styles.pillFull, pressStyle]}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.bullet}>
        <Plus color={surfaces.onPrimary} size={17} strokeWidth={2.6} />
      </View>
    </AnimatedPressable>
  );
}
