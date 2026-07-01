import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { formatMoney, formatSignedMoney } from '../../constants/financeCategories';
import type { FinanceOverview } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';
import { AnimatedBalanceText } from './AnimatedBalanceText';
import { BalanceTrendSparkline } from './BalanceTrendSparkline';

type BalanceHeroWidgetProps = {
  overview: FinanceOverview;
  cardholder?: string;
};

export function BalanceHeroWidget({ overview }: BalanceHeroWidgetProps) {
  const { theme } = useTheme();
  const changePrefix = overview.balanceChangePercent >= 0 ? '+' : '';
  const changeColor = overview.balanceChangePercent >= 0 ? '#34D399' : '#F87171';

  return (
    <GlassPanel borderRadius={28} style={{ marginBottom: 16 }} intensity={30}>
      <LinearGradient
        colors={[`${theme.primaryNeon}28`, 'rgba(255,255,255,0.08)', `${theme.primary}12`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 20,
          borderRadius: 28,
          shadowColor: theme.primaryNeon,
          shadowOpacity: 0.15,
          shadowRadius: 20,
        }}
      >
        <Text
          className="text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: theme.textMuted }}
        >
          Total Balance
        </Text>

        <AnimatedBalanceText
          value={overview.balance}
          currency={overview.displayCurrency}
          className="mt-2 text-4xl font-black"
          style={{ color: theme.textPrimary }}
        />

        <View className="mt-3 flex-row items-end justify-between">
          {overview.balanceChangePercent !== 0 || overview.balanceTrendPoints.length > 1 ? (
            <View>
              <View
                className="self-start rounded-full px-3 py-1"
                style={{
                  backgroundColor: `${changeColor}18`,
                }}
              >
                <Text className="text-xs font-bold" style={{ color: changeColor }}>
                  {changePrefix}
                  {overview.balanceChangePercent}% vs last month
                </Text>
              </View>
            </View>
          ) : (
            <View />
          )}
          {overview.balanceTrendPoints.length > 1 ? (
            <BalanceTrendSparkline points={overview.balanceTrendPoints} color={theme.primary} />
          ) : null}
        </View>

        {overview.balancesByCurrency.length > 1 ? (
          <View className="mt-2 flex-row flex-wrap gap-2">
            {overview.balancesByCurrency
              .filter((entry) => entry.currency !== overview.displayCurrency)
              .map((entry) => (
                <View
                  key={entry.currency}
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: `${theme.primary}12` }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: theme.textSecondary }}>
                    {formatMoney(entry.balance, entry.currency)}
                  </Text>
                </View>
              ))}
          </View>
        ) : null}

        <Text className="mt-3 text-xs font-semibold" style={{ color: theme.textMuted }}>
          This month · {formatSignedMoney(overview.monthlyDelta, overview.displayCurrency)}
        </Text>
      </LinearGradient>
    </GlassPanel>
  );
}
