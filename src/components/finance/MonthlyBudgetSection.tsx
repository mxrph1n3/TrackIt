import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { formatMoney } from '../../constants/financeCategories';
import { deleteMonthlyBudget, upsertMonthlyBudget } from '../../lib/finance/mutations';
import { reportSyncError, reportSyncSuccess } from '../../lib/sync/reportSyncError';
import type { FinanceOverview } from '../../types/finance';
import { useTheme } from '../../theme/ThemeContext';
import { BudgetProgressBar } from './BudgetProgressBar';

type MonthlyBudgetSectionProps = {
  overview: FinanceOverview;
  onUpdated?: () => void;
};

export function MonthlyBudgetSection({ overview, onUpdated }: MonthlyBudgetSectionProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(!overview.hasBudget);
  const [draftLimit, setDraftLimit] = useState(
    overview.hasBudget ? String(Math.round(overview.monthlyBudget)) : '',
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const parsed = Number.parseFloat(draftLimit.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      reportSyncError('Finance', new Error('invalid budget'), 'Enter a positive monthly budget.');
      return;
    }

    setIsSaving(true);
    try {
      await upsertMonthlyBudget(parsed);
      reportSyncSuccess('Monthly budget saved.');
      setIsEditing(false);
      onUpdated?.();
    } catch (error) {
      reportSyncError('Finance', error, 'Could not save monthly budget.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await deleteMonthlyBudget();
      setDraftLimit('');
      setIsEditing(true);
      reportSyncSuccess('Monthly budget cleared.');
      onUpdated?.();
    } catch (error) {
      reportSyncError('Finance', error, 'Could not clear monthly budget.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View>
      {overview.hasBudget && !isEditing ? (
        <View>
          <View className="mb-2 flex-row items-end justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-ethereal-slate">
                Monthly limit
              </Text>
              <Text className="mt-1 text-2xl font-black text-ethereal-ink">
                {formatMoney(overview.monthlyBudget, overview.displayCurrency)}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-ethereal-slate">
              Spent {formatMoney(overview.expenses.amount, overview.displayCurrency)}
            </Text>
          </View>

          <BudgetProgressBar
            percent={overview.budgetSpentPercent}
            isBreached={overview.isBudgetBreached}
          />

          <Text className="mt-3 text-xs leading-5 text-ethereal-slate">
            Shield strength and XP multiplier depend on staying within this budget.
          </Text>

          <View className="mt-4 flex-row gap-2">
            <Pressable
              onPress={() => setIsEditing(true)}
              className="flex-1 rounded-xl px-4 py-3 active:opacity-85"
              style={{ backgroundColor: `${theme.primary}18`, borderWidth: 1, borderColor: theme.borderSubtle }}
            >
              <Text className="text-center text-sm font-bold" style={{ color: theme.primary }}>
                Edit budget
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void handleClear()}
              disabled={isSaving}
              className="rounded-xl px-4 py-3 active:opacity-85"
              style={{ borderWidth: 1, borderColor: theme.borderSubtle }}
            >
              <Text className="text-center text-sm font-semibold" style={{ color: theme.textMuted }}>
                Clear
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          <Text className="text-sm leading-6 text-ethereal-slate">
            Set a monthly spending cap for your profile. It powers shield tracking, boss debuffs,
            and XP multipliers — account linking comes later.
          </Text>

          <TextInput
            value={draftLimit}
            onChangeText={setDraftLimit}
            keyboardType="decimal-pad"
            placeholder="Monthly limit"
            placeholderTextColor={theme.textMuted}
            className="mt-4 rounded-2xl border px-4 py-3 text-base font-semibold"
            style={{
              borderColor: theme.borderSubtle,
              color: theme.textPrimary,
              backgroundColor: `${theme.primary}08`,
            }}
          />

          <Pressable
            onPress={() => void handleSave()}
            disabled={isSaving}
            className="mt-4 rounded-xl px-4 py-3 active:opacity-85"
            style={{ backgroundColor: theme.primary }}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center text-sm font-bold text-white">Save monthly budget</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
