import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatMoney } from '../../constants/financeCategories';
import { tFinanceCategory } from '../../i18n/helpers';
import type { ExpenseCategoryStat } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';
import { TrackItIcon } from '../ui/TrackItIcon';

type CategoryBreakdownSectionProps = {
  categories: ExpenseCategoryStat[];
  onCategoryPress?: (categoryId: string) => void;
};

export function CategoryBreakdownSection({
  categories,
  onCategoryPress,
}: CategoryBreakdownSectionProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="p-5">
        <Text
          className="mb-4 text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: theme.textMuted }}
        >
          {t('finance.spendingByCategory')}
        </Text>

        {categories.length === 0 ? (
          <Text className="text-center text-sm" style={{ color: theme.textMuted }}>
            {t('finance.noExpensesMonth')}
          </Text>
        ) : (
          categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => onCategoryPress?.(cat.id)}
              className="mb-3 active:opacity-85"
            >
              <View className="mb-1.5 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <TrackItIcon name={cat.icon} size={16} color={cat.color} />
                  <Text className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                    {tFinanceCategory(t, cat.id, cat.name)}
                  </Text>
                </View>
                <Text className="text-xs font-bold" style={{ color: theme.textMuted }}>
                  {cat.percentage}% · {formatMoney(cat.amount)}
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
                <View
                  className="h-full rounded-full"
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                />
              </View>
            </Pressable>
          ))
        )}
      </View>
    </GlassPanel>
  );
}
