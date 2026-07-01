import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { premiumSpringConfig, MOTION_DURATION, timingEntrance, timingLoop } from '../../theme/motion';
import { TabBarLayout } from '../../theme/obsidian';
import { useTheme } from '../../theme/ThemeContext';
import { CrystalEmblemIcon } from '../ui/CrystalEmblemIcon';
import { ACTION_HUB } from './actionHubTheme';
import { useActionHubCrystalState } from './useActionHubCrystalState';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SIZE = ACTION_HUB.medallionSize;

type ActionHubButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
  size?: number;
  showStateIndicators?: boolean;
};

export function ActionHubButton({
  isOpen,
  onToggle,
  size = SIZE,
  showStateIndicators = true,
}: ActionHubButtonProps) {
  const { theme, isDark } = useTheme();
  const crystalState = useActionHubCrystalState();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const innerShift = useSharedValue(0);
  const glow = useSharedValue(0.45);

  const lockCenter = !showStateIndicators;

  useEffect(() => {
    rotation.value = withTiming(isOpen && !lockCenter ? ACTION_HUB.crystalRotationDeg : 0, timingEntrance(ACTION_HUB.openDurationMs));
    innerShift.value = withTiming(isOpen && !lockCenter ? 3 : 0, timingEntrance(ACTION_HUB.openDurationMs));
  }, [innerShift, isOpen, lockCenter, rotation]);

  useEffect(() => {
    if (isOpen) {
      glow.value = 0.72;
      return;
    }

    glow.value = withRepeat(
      withSequence(
        withTiming(0.38, timingLoop(MOTION_DURATION.ambient)),
        withTiming(0.72, timingLoop(MOTION_DURATION.ambient)),
      ),
      -1,
      false,
    );
  }, [glow, isOpen]);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const crystalStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const ringSize = size - 10;
  const stroke = 2.5;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference * (1 - Math.min(100, crystalState.workoutProgress) / 100);
  const innerDiskSize = size - 14;
  const glowInset = (size - (size - 8)) / 2;
  const diskGradient = isDark
    ? (['#2A2540', '#1E1A32', '#16122A'] as const)
    : (['#FFFFFF', '#F8F7FF', '#F3F1FF'] as const);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.96, premiumSpringConfig);
          if (!lockCenter) {
            innerShift.value = withSpring(2, premiumSpringConfig);
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, premiumSpringConfig);
          if (!isOpen && !lockCenter) {
            innerShift.value = withSpring(0, premiumSpringConfig);
          }
          if (isOpen && !lockCenter) {
            innerShift.value = withSpring(3, premiumSpringConfig);
          }
        }}
        style={[styles.hitArea, { width: size, height: size }, buttonStyle]}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Close Action Hub' : 'Open Action Hub'}
      >
        <View
          style={[
            styles.medallion,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: isDark ? 'rgba(149, 128, 232, 0.45)' : ACTION_HUB.glassBorder,
              backgroundColor: isDark
                ? 'rgba(22, 18, 38, 0.92)'
                : Platform.OS === 'ios'
                  ? 'rgba(255,255,255,0.42)'
                  : 'rgba(255,255,255,0.94)',
              shadowOpacity: isDark ? 0.32 : 0.14,
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={isDark ? 36 : 32} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          ) : null}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowLayer,
              {
                top: glowInset,
                left: glowInset,
                width: size - 8,
                height: size - 8,
                borderRadius: (size - 8) / 2,
              },
              crystalState.hasStreakGlow && showStateIndicators ? glowStyle : { opacity: 0.35 },
            ]}
          />

          <View
            style={[
              styles.innerDisk,
              {
                width: innerDiskSize,
                height: innerDiskSize,
                borderRadius: innerDiskSize / 2,
                borderColor: isDark ? 'rgba(149, 128, 232, 0.4)' : 'rgba(255, 255, 255, 0.85)',
              },
            ]}
          >
            <LinearGradient
              colors={[...diskGradient]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {crystalState.hasActiveWorkout && showStateIndicators ? (
              <Svg width={ringSize} height={ringSize} style={styles.progressRing}>
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke="rgba(124, 92, 252, 0.15)"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  stroke={ACTION_HUB.crystalPurple}
                  strokeWidth={stroke}
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin={`${ringSize / 2}, ${ringSize / 2}`}
                />
              </Svg>
            ) : null}

            <Animated.View style={[styles.crystalIconWrap, crystalStyle]}>
              <CrystalEmblemIcon size={Math.round(size * 0.36)} color={ACTION_HUB.crystalPurple} />
            </Animated.View>
          </View>
        </View>

        {crystalState.hasOverdueDot && showStateIndicators ? (
          <View style={styles.overdueDot} />
        ) : null}
      </AnimatedPressable>
    </View>
  );
}

/** Tab bar anchor sizing — keeps overlap aligned with layout tokens. */
export const ACTION_HUB_TAB_SIZE = TabBarLayout.fabSize;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallion: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ACTION_HUB.glassBorder,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 10,
  },
  glowLayer: {
    position: 'absolute',
    backgroundColor: 'rgba(124, 92, 252, 0.22)',
  },
  innerDisk: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  crystalIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  overdueDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
