import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { formatMoney, formatSignedMoney, SUPPORTED_CURRENCIES } from '../../constants/financeCategories';
import { createFinanceAccount } from '../../lib/finance/mutations';
import { DEFAULT_CURRENCY } from '../../lib/finance/currency';
import type { FinanceAccount } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';
import { TrackItIcon } from '../ui/TrackItIcon';

const ACCOUNT_PRESETS = [
  { icon: 'credit-card', label: 'Card', color: '#775DD8' },
  { icon: 'banknote', label: 'Cash', color: '#34D399' },
  { icon: 'landmark', label: 'Savings', color: '#6366F1' },
];

type AccountCardsRowProps = {
  accounts: FinanceAccount[];
  onCreated?: () => void;
};

export function AccountCardsRow({ accounts, onCreated }: AccountCardsRowProps) {
  const { theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [preset, setPreset] = useState(ACCOUNT_PRESETS[0]);
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await createFinanceAccount({ name, icon: preset.icon, color: preset.color, currency });
      setName('');
      setCurrency(DEFAULT_CURRENCY);
      setIsAdding(false);
      onCreated?.();
    } catch (error) {
      console.warn('[AccountCardsRow] create failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (accounts.length === 0 && !isAdding) {
    return (
      <GlassPanel borderRadius={24}>
        <View className="items-center p-6">
          <TrackItIcon name="credit-card" size={28} color={theme.primary} badge badgeSize={52} />
          <Text className="mt-2 text-sm font-semibold" style={{ color: theme.textPrimary }}>
            No accounts yet
          </Text>
          <Pressable
            onPress={() => setIsAdding(true)}
            className="mt-4 rounded-xl px-4 py-2 active:opacity-85"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-sm font-bold text-ethereal-ink">Add Account</Text>
          </Pressable>
        </View>
      </GlassPanel>
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
      >
        {accounts.map((account) => (
          <GlassPanel key={account.id} borderRadius={22} style={{ width: 168 }}>
            <View className="p-4">
              <TrackItIcon name={account.icon} size={22} color={account.color} badge badgeSize={44} />
              <Text
                className="mt-2 text-sm font-bold"
                style={{ color: theme.textPrimary }}
                numberOfLines={1}
              >
                {account.name}
              </Text>
              <Text className="mt-1 text-lg font-black" style={{ color: account.color }}>
                {formatMoney(account.balance, account.currency)}
              </Text>
              {account.lastChangeAmount !== null ? (
                <Text className="mt-2 text-[10px] font-semibold" style={{ color: theme.textMuted }}>
                  {formatSignedMoney(account.lastChangeAmount)} · {account.lastChangeLabel}
                </Text>
              ) : null}
            </View>
          </GlassPanel>
        ))}

        <Pressable onPress={() => setIsAdding(true)} className="active:opacity-85">
          <GlassPanel borderRadius={22} style={{ width: 120, height: '100%', minHeight: 120 }}>
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-2xl">+</Text>
              <Text className="mt-1 text-xs font-bold" style={{ color: theme.primary }}>
                Add
              </Text>
            </View>
          </GlassPanel>
        </Pressable>
      </ScrollView>

      {isAdding ? (
        <View
          className="mt-3 rounded-2xl border p-4"
          style={{ borderColor: theme.borderSubtle, backgroundColor: `${theme.primary}08` }}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Account name"
            placeholderTextColor={theme.textMuted}
            className="mb-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ color: theme.textPrimary, borderColor: theme.borderSubtle }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {ACCOUNT_PRESETS.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => setPreset(item)}
                className="rounded-full px-3 py-2 active:opacity-85"
                style={{
                  backgroundColor: preset.label === item.label ? `${item.color}33` : `${theme.primary}10`,
                  borderWidth: 1,
                  borderColor: preset.label === item.label ? item.color : theme.borderSubtle,
                }}
              >
                <View className="flex-row items-center gap-1.5">
                  <TrackItIcon name={item.icon} size={14} color={item.color} />
                  <Text style={{ color: theme.textPrimary }}>{item.label}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
          <Text className="mb-2 mt-1 text-[10px] font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            Currency
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SUPPORTED_CURRENCIES.map((item) => (
              <Pressable
                key={item.code}
                onPress={() => setCurrency(item.code)}
                className="rounded-full px-3 py-2 active:opacity-85"
                style={{
                  backgroundColor: currency === item.code ? `${theme.primary}22` : `${theme.primary}10`,
                  borderWidth: 1,
                  borderColor: currency === item.code ? theme.primary : theme.borderSubtle,
                }}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 12 }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            onPress={() => void handleCreate()}
            disabled={isSaving}
            className="mt-3 items-center rounded-xl py-3 active:opacity-90"
            style={{ backgroundColor: theme.primary, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.textPrimary} />
            ) : (
              <Text className="font-bold text-ethereal-ink">Create Account</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
