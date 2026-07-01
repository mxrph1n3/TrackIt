import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { MOTION_DURATION, timingLoop, timingStandard } from '../../theme/motion';

type BudgetProgressBarProps = {
  percent: number;
  isBreached: boolean;
};

export function BudgetProgressBar({ percent, isBreached }: BudgetProgressBarProps) {
  const pulse = useSharedValue(1);
  const clampedPercent = Math.min(percent, 100);

  useEffect(() => {
    if (isBreached) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, timingLoop(MOTION_DURATION.chart)),
          withTiming(1, timingLoop(MOTION_DURATION.chart)),
        ),
        -1,
        false,
      );
    } else {
      pulse.value = withTiming(1, timingStandard());
    }
  }, [isBreached, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: isBreached ? 0.85 + (pulse.value - 1) * 2 : 1,
  }));

  const fillColors = isBreached
    ? (['#EF4444', '#B91C1C'] as const)
    : (['#775DD8', '#6366F1'] as const);

  return (
    <View className="mt-5">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-ethereal-slate">
          Spent: {percent}%
        </Text>
        <Text
          className={`text-sm font-bold ${isBreached ? 'text-finance-red' : 'text-obsidian-primary'}`}
        >
          {isBreached ? 'Over budget' : 'On track'}
        </Text>
      </View>

      <Animated.View style={glowStyle}>
        <View
          className={`h-3 overflow-hidden rounded-full border ${
            isBreached ? 'border-red-500/50 bg-red-950/40' : 'border-obsidian-border bg-white/5'
          }`}
        >
          <LinearGradient
            colors={fillColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${clampedPercent}%`, height: '100%', borderRadius: 999 }}
          />
        </View>
      </Animated.View>
    </View>
  );
}
