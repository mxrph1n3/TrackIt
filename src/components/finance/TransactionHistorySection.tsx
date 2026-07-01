import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { formatSignedMoney } from '../../constants/financeCategories';
import type { FinanceTransaction, TransactionType } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';
import { TrackItIcon } from '../ui/TrackItIcon';

type TransactionHistorySectionProps = {
  transactions: FinanceTransaction[];
  categoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return `Today · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TransactionHistorySection({
  transactions,
  categoryFilter,
  onClearCategoryFilter,
}: TransactionHistorySectionProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        if (categoryFilter && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (!q) return true;
        return (
          tx.label.toLowerCase().includes(q) ||
          tx.categoryLabel.toLowerCase().includes(q) ||
          (tx.accountName?.toLowerCase().includes(q) ?? false)
        );
      })
      .slice(0, categoryFilter || q ? 50 : 20);
  }, [categoryFilter, query, transactions, typeFilter]);

  const activeCategoryLabel = categoryFilter
    ? transactions.find((tx) => tx.category === categoryFilter)?.categoryLabel
    : null;

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="p-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            className="text-[10px] font-bold uppercase tracking-[2px]"
            style={{ color: theme.textMuted }}
          >
            Recent Operations
          </Text>
          {categoryFilter ? (
            <Pressable onPress={onClearCategoryFilter} className="active:opacity-85">
              <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
                Clear filter
              </Text>
            </Pressable>
          ) : null}
        </View>

        {activeCategoryLabel ? (
          <View
            className="mb-3 self-start rounded-full px-3 py-1"
            style={{ backgroundColor: `${theme.primary}18` }}
          >
            <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
              {activeCategoryLabel}
            </Text>
          </View>
        ) : null}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search transactions…"
          placeholderTextColor={theme.textMuted}
          className="mb-3 rounded-xl border px-4 py-3 text-sm font-medium"
          style={{
            color: theme.textPrimary,
            borderColor: theme.borderSubtle,
            backgroundColor: `${theme.primary}08`,
          }}
        />

        <View className="mb-4 flex-row gap-2">
          {(['all', 'expense', 'income'] as const).map((filter) => {
            const active = typeFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setTypeFilter(filter)}
                className="rounded-full px-3 py-1.5 active:opacity-85"
                style={{
                  backgroundColor: active ? theme.primary : `${theme.primary}10`,
                }}
              >
                <Text
                  className="text-[10px] font-bold uppercase"
                  style={{ color: active ? theme.textPrimary : theme.textMuted }}
                >
                  {filter === 'all' ? 'All' : filter}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filtered.length === 0 ? (
          <Text className="text-center text-sm" style={{ color: theme.textMuted }}>
            {transactions.length === 0 ? 'No operations yet.' : 'No matches found.'}
          </Text>
        ) : (
          filtered.map((tx) => {
            const signed = tx.type === 'expense' ? -tx.amount : tx.amount;
            return (
              <Pressable key={tx.id} className="mb-3 flex-row items-center active:opacity-85">
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${theme.primary}14` }}
                >
                  <TrackItIcon name={tx.categoryIcon} size={18} color={theme.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                    {tx.label}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.textMuted }}>
                    {tx.categoryLabel}
                    {tx.accountName ? ` · ${tx.accountName}` : ''}
                  </Text>
                  <Text className="text-[10px]" style={{ color: theme.textMuted }}>
                    {formatWhen(tx.occurredAt)}
                  </Text>
                </View>
                <Text
                  className="text-sm font-black"
                  style={{ color: tx.type === 'income' ? '#34D399' : theme.textPrimary }}
                >
                  {formatSignedMoney(signed)}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </GlassPanel>
  );
}
