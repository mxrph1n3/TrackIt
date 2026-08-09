import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { formatMoney } from '../../constants/financeCategories';
import { createFinanceGoal } from '../../lib/finance/mutations';
import type { FinanceGoal } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { TrackItIcon } from '../ui/TrackItIcon';

type SavingsGoalsSectionProps = {
  goals: FinanceGoal[];
  onCreated?: () => void;
};

export function SavingsGoalsSection({ goals, onCreated }: SavingsGoalsSectionProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    const parsed = Number.parseFloat(target.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(parsed) || parsed <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      await createFinanceGoal({ name, targetAmount: parsed });
      setName('');
      setTarget('');
      setIsAdding(false);
      onCreated?.();
    } catch (error) {
      console.warn('[SavingsGoalsSection] create failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (goals.length === 0 && !isAdding) {
    return (
      <View className="items-center py-2">
        <Text className="text-center text-sm" style={{ color: theme.textMuted }}>
          {t('finance.noGoalsYet')}
        </Text>
        <Pressable
          onPress={() => setIsAdding(true)}
          className="mt-3 rounded-xl px-4 py-2 active:opacity-85"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-sm font-bold text-ethereal-ink">{t('finance.addGoal')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pr-1">
        {goals.map((goal) => (
          <View
            key={goal.id}
            className="w-52 rounded-2xl border p-4"
            style={{ borderColor: theme.borderSubtle, backgroundColor: `${theme.primary}08` }}
          >
            <TrackItIcon name={goal.icon} size={22} color={goal.color} badge badgeSize={44} />
            <Text className="mt-2 text-sm font-bold" style={{ color: theme.textPrimary }}>
              {goal.name}
            </Text>
            <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              {formatMoney(goal.savedAmount)} / {formatMoney(goal.targetAmount)}
            </Text>
            {goal.targetDate ? (
              <Text className="mt-1 text-[10px]" style={{ color: theme.textMuted }}>
                {t('finance.target')} · {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            ) : null}
            <View className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${goal.percent}%`, backgroundColor: goal.color }}
              />
            </View>
            <Text className="mt-2 text-xs font-bold" style={{ color: theme.primary }}>
              {t('finance.percentComplete', { percent: goal.percent })}
            </Text>
          </View>
        ))}

        <Pressable onPress={() => setIsAdding(true)} className="active:opacity-85">
          <View
            className="h-full min-h-[140] w-28 items-center justify-center rounded-2xl border"
            style={{ borderColor: theme.borderSubtle, backgroundColor: `${theme.primary}06` }}
          >
            <Text className="text-2xl">+</Text>
            <Text className="mt-1 text-xs font-bold" style={{ color: theme.primary }}>
              {t('common.add')}
            </Text>
          </View>
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
            placeholder={t('finance.goalNamePlaceholder')}
            placeholderTextColor={theme.textMuted}
            className="mb-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ color: theme.textPrimary, borderColor: theme.borderSubtle }}
          />
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder={t('finance.goalAmountPlaceholder')}
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
            className="mb-3 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ color: theme.textPrimary, borderColor: theme.borderSubtle }}
          />
          <Pressable
            onPress={() => void handleCreate()}
            disabled={isSaving}
            className="items-center rounded-xl py-3 active:opacity-90"
            style={{ backgroundColor: theme.primary, opacity: isSaving ? 0.7 : 1 }}
          >
            {isSaving ? (
              <ActivityIndicator color={theme.textPrimary} />
            ) : (
              <Text className="font-bold text-ethereal-ink">{t('finance.createGoal')}</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
