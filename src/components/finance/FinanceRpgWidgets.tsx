import { ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { formatMoney } from '../../constants/financeCategories';
import { tFinanceCategory } from '../../i18n/helpers';
import { triggerHaptic } from '../../lib/platform/haptics';
import type { FinanceOverview } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

type FinanceCashFlowCardsProps = {
  overview: FinanceOverview;
};

export function FinanceCashFlowCards({ overview }: FinanceCashFlowCardsProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-4 flex-row gap-3">
      <GlassPanel borderRadius={20} style={{ flex: 1 }}>
        <View className="p-4">
          <View className="mb-2 flex-row items-center gap-1">
            <ArrowUpRight color="#34D399" size={14} strokeWidth={2.4} />
            <Text className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {t('finance.income')}
            </Text>
          </View>
          <Text className="text-xl font-black text-emerald-400">
            {formatMoney(overview.income.amount, overview.displayCurrency)}
          </Text>
        </View>
      </GlassPanel>

      <GlassPanel borderRadius={20} style={{ flex: 1 }}>
        <View className="p-4">
          <View className="mb-2 flex-row items-center gap-1">
            <ArrowDownRight color="#F87171" size={14} strokeWidth={2.4} />
            <Text className="text-[10px] font-bold uppercase tracking-wider text-red-400">
              {t('finance.expenses')}
            </Text>
          </View>
          <Text className="text-xl font-black text-red-400">
            {formatMoney(overview.expenses.amount, overview.displayCurrency)}
          </Text>
        </View>
      </GlassPanel>
    </View>
  );
}

type FinanceQuickControlBarProps = {
  onIncome: () => void;
  onExpense: () => void;
};

export function FinanceQuickControlBar({ onIncome, onExpense }: FinanceQuickControlBarProps) {
  const { t } = useTranslation();
  const openIncome = () => {
    void triggerHaptic('medium');
    onIncome();
  };

  const openExpense = () => {
    void triggerHaptic('medium');
    onExpense();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Pressable onPress={openIncome} className="flex-1 active:opacity-90">
        <View
          className="flex-row items-center justify-center gap-2 rounded-2xl py-3.5"
          style={{ backgroundColor: 'rgba(52, 211, 153, 0.92)' }}
        >
          <Plus color="#fff" size={18} strokeWidth={2.5} />
          <Text className="text-sm font-black text-white">{t('finance.income')}</Text>
        </View>
      </Pressable>
      <Pressable onPress={openExpense} className="flex-1 active:opacity-90">
        <View
          className="flex-row items-center justify-center gap-2 rounded-2xl py-3.5"
          style={{ backgroundColor: 'rgba(248, 113, 113, 0.92)' }}
        >
          <Plus color="#fff" size={18} strokeWidth={2.5} />
          <Text className="text-sm font-black text-white">{t('finance.expense')}</Text>
        </View>
      </Pressable>
    </View>
  );
}

type FinanceLastTransactionCardProps = {
  overview: FinanceOverview;
};

export function FinanceLastTransactionCard({ overview }: FinanceLastTransactionCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const tx = overview.lastTransaction;

  if (!tx) return null;

  const isExpense = tx.type === 'expense';

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="p-5">
        <Text
          className="mb-3 text-[10px] font-bold uppercase tracking-[2px]"
          style={{ color: theme.textMuted }}
        >
          {t('finance.lastTransaction')}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-black" style={{ color: theme.textPrimary }}>
              {tx.label}
            </Text>
            <Text className="mt-0.5 text-xs font-semibold" style={{ color: theme.textSecondary }}>
              {tFinanceCategory(t, tx.category, tx.categoryLabel)} · {t('finance.recently')}
            </Text>
          </View>
          <Text
            className="text-base font-black"
            style={{ color: isExpense ? '#F87171' : '#34D399' }}
          >
            {isExpense ? '−' : '+'}
            {formatMoney(tx.amount, overview.displayCurrency)}
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
}
