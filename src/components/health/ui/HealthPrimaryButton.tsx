import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { triggerHaptic } from '../../../lib/platform/haptics';
import { HEALTH_ELEVATION } from './healthTheme';
import { pressInSpring, pressOutSpring } from '../../../theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HealthPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: 'solid' | 'outline';
  disabled?: boolean;
};

export function HealthPrimaryButton({
  label,
  onPress,
  icon,
  variant = 'solid',
  disabled = false,
}: HealthPrimaryButtonProps) {
  const healthTheme = useHealthTheme();
  const scale = useSharedValue(1);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          borderRadius: healthTheme.radius.control,
          paddingVertical: 16,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
        },
        solid: {
          backgroundColor: healthTheme.accent,
        },
        outline: {
          backgroundColor: healthTheme.card,
          borderWidth: 1,
          borderColor: healthTheme.cardBorder,
        },
        disabled: {
          opacity: 0.5,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        label: {
          fontSize: 16,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        labelSolid: {
          color: healthTheme.ink,
        },
        labelOutline: {
          color: healthTheme.accent,
        },
      }),
    [healthTheme],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    void triggerHaptic('medium');
    onPress();
  };

  const isSolid = variant === 'solid';

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.97, pressInSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressOutSpring);
      }}
      style={[
        styles.base,
        isSolid ? styles.solid : styles.outline,
        isSolid ? HEALTH_ELEVATION.button : null,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      <View style={styles.row}>
        {icon}
        <Text style={[styles.label, isSolid ? styles.labelSolid : styles.labelOutline]}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
}
