import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { formatMoney } from '../../constants/financeCategories';
import { createFinanceSubscription } from '../../lib/finance/mutations';
import type { FinanceSubscription } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';

type SubscriptionsSectionProps = {
  subscriptions: FinanceSubscription[];
  total: number;
  onCreated?: () => void;
};

export function SubscriptionsSection({ subscriptions, onCreated }: SubscriptionsSectionProps) {
  const { theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isSaving, setIsSaving] = useState(false);

  const monthlyTotal = useMemo(
    () =>
      subscriptions.reduce((sum, sub) => {
        if (sub.billingCycle === 'yearly') return sum + sub.amount / 12;
        if (sub.billingCycle === 'weekly') return sum + sub.amount * 4;
        return sum + sub.amount;
      }, 0),
    [subscriptions],
  );

  const yearlyTotal = useMemo(
    () =>
      subscriptions.reduce((sum, sub) => {
        if (sub.billingCycle === 'yearly') return sum + sub.amount;
        if (sub.billingCycle === 'weekly') return sum + sub.amount * 52;
        return sum + sub.amount * 12;
      }, 0),
    [subscriptions],
  );

  const handleCreate = async () => {
    const parsed = Number.parseFloat(amount.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      await createFinanceSubscription({ name, amount: parsed, billingCycle: cycle });
      setName('');
      setAmount('');
      setIsAdding(false);
      onCreated?.();
    } catch (error) {
      console.warn('[SubscriptionsSection] create failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (subscriptions.length === 0 && !isAdding) {
    return (
      <View className="items-center py-2">
        <Text className="text-center text-sm" style={{ color: theme.textMuted }}>
          No active subscriptions tracked.
        </Text>
        <Pressable
          onPress={() => setIsAdding(true)}
          className="mt-3 rounded-xl px-4 py-2 active:opacity-85"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-sm font-bold text-ethereal-ink">Add Subscription</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      {subscriptions.map((sub) => (
        <View
          key={sub.id}
          className="mb-2 flex-row items-center justify-between rounded-xl border px-3 py-3"
          style={{ borderColor: theme.borderSubtle, backgroundColor: `${theme.primary}06` }}
        >
          <View>
            <Text className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              {sub.name}
            </Text>
            <Text className="mt-0.5 text-xs" style={{ color: theme.textMuted }}>
              Next · {sub.nextBillingLabel} · {sub.billingCycle}
            </Text>
          </View>
          <Text className="text-sm font-bold" style={{ color: theme.textPrimary }}>
            {formatMoney(sub.amount, sub.currency)}
          </Text>
        </View>
      ))}

      <View className="mt-2 flex-row gap-2">
        <View
          className="flex-1 rounded-xl border px-3 py-3"
          style={{ borderColor: `${theme.primary}44`, backgroundColor: `${theme.primary}12` }}
        >
          <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Monthly
          </Text>
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            {formatMoney(Math.round(monthlyTotal))}
          </Text>
        </View>
        <View
          className="flex-1 rounded-xl border px-3 py-3"
          style={{ borderColor: `${theme.primary}44`, backgroundColor: `${theme.primary}12` }}
        >
          <Text className="text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Yearly
          </Text>
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            {formatMoney(Math.round(yearlyTotal))}
          </Text>
        </View>
      </View>

      {!isAdding ? (
        <Pressable onPress={() => setIsAdding(true)} className="mt-3 active:opacity-85">
          <Text className="text-center text-xs font-bold" style={{ color: theme.primary }}>
            + Add subscription
          </Text>
        </Pressable>
      ) : (
        <View
          className="mt-3 rounded-2xl border p-4"
          style={{ borderColor: theme.borderSubtle, backgroundColor: `${theme.primary}08` }}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Service name"
            placeholderTextColor={theme.textMuted}
            className="mb-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ color: theme.textPrimary, borderColor: theme.borderSubtle }}
          />
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
            className="mb-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ color: theme.textPrimary, borderColor: theme.borderSubtle }}
          />
          <View className="mb-3 flex-row gap-2">
            {(['monthly', 'yearly'] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setCycle(item)}
                className="flex-1 rounded-xl py-2 active:opacity-85"
                style={{
                  backgroundColor: cycle === item ? theme.primary : `${theme.primary}10`,
                }}
              >
                <Text
                  className="text-center text-xs font-bold capitalize"
                  style={{ color: cycle === item ? theme.textPrimary : theme.textMuted }}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => void handleCreate()}
            disabled={isSaving}
            className="items-center rounded-xl py-3 active:opacity-90"
            style={{ backgroundColor: theme.primary, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.textPrimary} />
            ) : (
              <Text className="font-bold text-ethereal-ink">Save Subscription</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
