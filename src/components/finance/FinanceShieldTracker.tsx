import { Shield } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { formatMoney } from '../../constants/financeCategories';
import {
  SHIELD_STATUS_COLORS,
  SHIELD_STATUS_LABELS,
} from '../../lib/finance/gamification';
import type { FinanceOverview } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { timingProgress } from '../../theme/motion';
import { GlassPanel } from '../GlassPanel';

type FinanceShieldTrackerProps = {
  overview: FinanceOverview;
};

export function FinanceShieldTracker({ overview }: FinanceShieldTrackerProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  const statusColor = SHIELD_STATUS_COLORS[overview.shieldStatus];
  const statusLabel = SHIELD_STATUS_LABELS[overview.shieldStatus];
  const fillPercent = overview.hasBudget ? overview.shieldStrengthPercent : 0;

  useEffect(() => {
    progress.value = withTiming(Math.min(100, fillPercent), timingProgress());
  }, [fillPercent, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Shield color={statusColor} size={18} strokeWidth={2.2} />
            <Text className="text-sm font-black" style={{ color: theme.textPrimary }}>
              Budget Shield
            </Text>
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: `${statusColor}18` }}
          >
            <Text className="text-[10px] font-bold" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {overview.hasBudget ? (
          <>
            <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
              <Animated.View
                className="h-full rounded-full"
                style={[barStyle, { backgroundColor: statusColor }]}
              />
            </View>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                {formatMoney(overview.expenses.amount, overview.displayCurrency)} spent
              </Text>
              <Text className="text-xs font-black" style={{ color: theme.textPrimary }}>
                {overview.budgetSpentPercent}%
              </Text>
              <Text className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                {formatMoney(overview.monthlyBudget, overview.displayCurrency)} limit
              </Text>
            </View>
            <Text className="mt-2 text-[11px] font-semibold" style={{ color: theme.textMuted }}>
              Shield strength {overview.shieldStrengthPercent}%
              {overview.isVulnerable ? ' · Vulnerable debuff active (−25% workout/focus XP)' : ''}
            </Text>
          </>
        ) : (
          <Text className="text-sm leading-5" style={{ color: theme.textSecondary }}>
            Set a monthly budget to activate your financial shield and track spending limits.
          </Text>
        )}
      </View>
    </GlassPanel>
  );
}
