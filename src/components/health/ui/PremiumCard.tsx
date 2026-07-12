import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { HEALTH_ELEVATION } from './healthTheme';
import { pressInSpring, pressOutSpring } from '../../../theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PremiumCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
  /** Use screen canvas color instead of elevated card surface (e.g. muscle map). */
  tone?: 'card' | 'canvas';
}>;

export function PremiumCard({ children, style, onPress, padding = 20, tone = 'card' }: PremiumCardProps) {
  const healthTheme = useHealthTheme();
  const scale = useSharedValue(1);

  const isCanvas = tone === 'canvas';
  const surfaceColor = isCanvas ? healthTheme.canvas : healthTheme.card;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shadow: {
          ...(isCanvas ? {} : HEALTH_ELEVATION.card),
          marginBottom: 16,
        },
        card: {
          backgroundColor: surfaceColor,
          borderRadius: healthTheme.radius.card,
          borderWidth: isCanvas ? 0 : 1,
          borderColor: healthTheme.cardBorder,
          overflow: 'hidden',
        },
      }),
    [healthTheme, isCanvas, surfaceColor],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );

  if (!onPress) {
    return (
      <View style={[styles.shadow, isCanvas && { backgroundColor: surfaceColor }, style]}>
        {content}
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.985, pressInSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressOutSpring);
      }}
      style={[
        styles.shadow,
        isCanvas && { backgroundColor: surfaceColor },
        animatedStyle,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
}
