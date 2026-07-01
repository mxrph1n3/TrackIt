import { ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { celebrateSpring, premiumSpringConfig, pressInSpring, pressOutSpring, timingEntrance } from '../../theme/motion';
import { BRAND } from '../../theme/designTokens';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FocusModePillButtonProps = {
  onPress: () => void;
  entryStyle?: AnimatedStyle;
  /** Delay before the pop-up entrance (ms). */
  entranceDelay?: number;
};

export function FocusModePillButton({
  onPress,
  entryStyle,
  entranceDelay = 0,
}: FocusModePillButtonProps) {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const pressScale = useSharedValue(1);
  const pillScale = useSharedValue(0.86);
  const pillOpacity = useSharedValue(0);
  const pillY = useSharedValue(22);
  const bulletScale = useSharedValue(0.4);

  useEffect(() => {
    pillOpacity.value = withDelay(
      entranceDelay,
      withTiming(1, timingEntrance()),
    );
    pillY.value = withDelay(
      entranceDelay,
      withSpring(0, celebrateSpring),
    );
    pillScale.value = withDelay(
      entranceDelay,
      withSpring(1, premiumSpringConfig),
    );

    bulletScale.value = withDelay(
      entranceDelay + 180,
      withSequence(
        withSpring(1.14, celebrateSpring),
        withSpring(1, premiumSpringConfig),
      ),
    );
  }, [bulletScale, entranceDelay, pillOpacity, pillScale, pillY]);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const popStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateY: pillY.value }, { scale: pillScale.value }],
  }));

  const bulletStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bulletScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.97, pressInSpring);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, pressOutSpring);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          width: '100%',
          alignSelf: 'stretch',
        },
        pill: {
          width: '100%',
          height: 56,
          borderRadius: 28,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 26,
          paddingRight: 7,
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
        label: {
          flexShrink: 1,
          marginRight: 14,
          color: theme.textMuted,
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 1.8,
          textTransform: 'uppercase',
        },
        bullet: {
          width: 42,
          height: 42,
          borderRadius: 21,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.primary,
          shadowColor: BRAND.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.28,
          shadowRadius: 10,
          elevation: 4,
        },
      }),
    [isDark, surfaces.chip, theme],
  );

  return (
    <Animated.View style={[styles.shell, entryStyle, popStyle]}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Enter focus mode"
        style={[styles.pill, pressStyle]}
      >
        <Text style={styles.label} numberOfLines={1}>
          ENTER FOCUS MODE
        </Text>

        <Animated.View style={[styles.bullet, bulletStyle]}>
          <ChevronRight color="#FFFFFF" size={18} strokeWidth={2.6} />
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}
