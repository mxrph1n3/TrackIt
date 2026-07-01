import { Skull } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { formatMoney } from '../../constants/financeCategories';
import type { FinanceOverview } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { timingProgress } from '../../theme/motion';
import { GlassPanel } from '../GlassPanel';

type FinanceBossTrackerProps = {
  overview: FinanceOverview;
  onPress?: () => void;
};

export function FinanceBossTracker({ overview, onPress }: FinanceBossTrackerProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const goal = overview.activeGoal;
  const bossPercent = goal?.percent ?? overview.bossProgressPercent;

  useEffect(() => {
    progress.value = withTiming(Math.min(100, bossPercent), timingProgress());
  }, [bossPercent, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  if (!goal) {
    return (
      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <Pressable onPress={onPress} className="p-5 active:opacity-90">
          <View className="flex-row items-center gap-2">
            <Skull color={theme.primary} size={18} strokeWidth={2.2} />
            <Text className="text-sm font-black" style={{ color: theme.textPrimary }}>
              Boss Battle
            </Text>
          </View>
          <Text className="mt-2 text-sm leading-5" style={{ color: theme.textSecondary }}>
            Create a savings goal to start a boss battle — every deposit deals damage.
          </Text>
        </Pressable>
      </GlassPanel>
    );
  }

  const isDefeated = goal.percent >= 100;

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <Pressable onPress={onPress} className="p-5 active:opacity-90">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Skull color={isDefeated ? '#34D399' : '#F87171'} size={18} strokeWidth={2.2} />
            <Text className="text-sm font-black" style={{ color: theme.textPrimary }}>
              {isDefeated ? 'Boss Defeated!' : 'Boss Battle'}
            </Text>
          </View>
          <Text className="text-xs font-black" style={{ color: theme.primary }}>
            {goal.percent}% damage
          </Text>
        </View>

        <Text className="text-base font-black" style={{ color: theme.textPrimary }}>
          {goal.name}
        </Text>
        <Text className="mt-1 text-xs font-semibold" style={{ color: theme.textSecondary }}>
          {formatMoney(goal.savedAmount, overview.displayCurrency)} /{' '}
          {formatMoney(goal.targetAmount, overview.displayCurrency)}
        </Text>

        <View className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
          <Animated.View
            className="h-full rounded-full bg-red-400"
            style={barStyle}
          />
        </View>
      </Pressable>
    </GlassPanel>
  );
}
