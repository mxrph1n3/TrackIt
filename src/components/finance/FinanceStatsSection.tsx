import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { formatMoney } from '../../constants/financeCategories';
import { computeAverageTicket, computeFinanceTrend } from '../../lib/finance/stats';
import type { FinanceTransaction, FinanceTrendPeriod } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

const PERIODS: { id: FinanceTrendPeriod; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: '3 Mo' },
  { id: 'year', label: 'Year' },
];

type FinanceStatsSectionProps = {
  transactions: FinanceTransaction[];
};

export function FinanceStatsSection({ transactions }: FinanceStatsSectionProps) {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<FinanceTrendPeriod>('month');

  const trend = useMemo(() => computeFinanceTrend(transactions, period), [period, transactions]);
  const avgTicket = useMemo(() => computeAverageTicket(transactions, period), [period, transactions]);

  const maxExpense = Math.max(...trend.map((p) => p.expense), 1);
  const chartWidth = 280;
  const chartHeight = 100;
  const barWidth = trend.length > 0 ? chartWidth / trend.length - 6 : 0;

  const totalIncome = trend.reduce((s, p) => s + p.income, 0);
  const totalExpense = trend.reduce((s, p) => s + p.expense, 0);
  const totalSavings = totalIncome - totalExpense;

  return (
    <GlassPanel borderRadius={24}>
      <View className="p-5">
        <Text
          className="mb-3 text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: theme.textMuted }}
        >
          Statistics
        </Text>

        <View className="mb-4 flex-row gap-2">
          {PERIODS.map((item) => {
            const active = period === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setPeriod(item.id)}
                className="flex-1 rounded-xl py-2 active:opacity-85"
                style={{
                  backgroundColor: active ? theme.primary : `${theme.primary}12`,
                }}
              >
                <Text
                  className="text-center text-[10px] font-bold uppercase"
                  style={{ color: active ? theme.textPrimary : theme.textMuted }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {trend.length === 0 ? (
          <Text className="text-center text-sm" style={{ color: theme.textMuted }}>
            Not enough data for this period.
          </Text>
        ) : (
          <>
            <Svg width={chartWidth} height={chartHeight} style={{ alignSelf: 'center' }}>
              {trend.map((point, index) => {
                const height = (point.expense / maxExpense) * (chartHeight - 10);
                const x = index * (barWidth + 6) + 4;
                return (
                  <Rect
                    key={point.key}
                    x={x}
                    y={chartHeight - height}
                    width={barWidth}
                    height={height}
                    rx={4}
                    fill={theme.primary}
                    opacity={0.85}
                  />
                );
              })}
            </Svg>

            <View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2">
              <StatChip label="Income" value={formatMoney(totalIncome)} color="#34D399" />
              <StatChip label="Expense" value={formatMoney(totalExpense)} color="#F87171" />
              <StatChip label="Savings" value={formatMoney(totalSavings)} color={theme.primary} />
              <StatChip label="Avg. ticket" value={formatMoney(avgTicket)} color={theme.textSecondary} />
            </View>
          </>
        )}
      </View>
    </GlassPanel>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View className="min-w-[45%] flex-1">
      <Text className="text-[9px] font-bold uppercase tracking-wider text-ethereal-slate">{label}</Text>
      <Text className="mt-0.5 text-sm font-black" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
