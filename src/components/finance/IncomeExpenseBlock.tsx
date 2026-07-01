import { Text, View } from 'react-native';

import { formatMoney } from '../../constants/financeCategories';
import type { FinanceOverview } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

type IncomeExpenseBlockProps = {
  overview: FinanceOverview;
};

export function IncomeExpenseBlock({ overview }: IncomeExpenseBlockProps) {
  const { theme } = useTheme();
  const total = Math.max(overview.income.amount + overview.expenses.amount, 1);
  const incomePercent = Math.round((overview.income.amount / total) * 100);
  const expensePercent = Math.round((overview.expenses.amount / total) * 100);

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="p-5">
        <Text
          className="mb-4 text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: theme.textMuted }}
        >
          Cash Flow · This Month
        </Text>

        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-bold" style={{ color: '#34D399' }}>
              Income
            </Text>
            <Text className="text-sm font-black" style={{ color: theme.textPrimary }}>
              {formatMoney(overview.income.amount, overview.displayCurrency)}
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
            <View className="h-full rounded-full bg-emerald-400" style={{ width: `${incomePercent}%` as `${number}%` }} />
          </View>
        </View>

        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-red-400">Expense</Text>
            <Text className="text-sm font-black" style={{ color: theme.textPrimary }}>
              {formatMoney(overview.expenses.amount, overview.displayCurrency)}
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
            <View className="h-full rounded-full bg-red-400" style={{ width: `${expensePercent}%` as `${number}%` }} />
          </View>
        </View>
      </View>
    </GlassPanel>
  );
}
