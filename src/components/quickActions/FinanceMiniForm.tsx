import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/financeCategories';
import { useFinanceLiveData } from '../../hooks/useFinanceLiveData';
import { useGamification } from '../../hooks/useGamification';
import { tFinanceCategory } from '../../i18n/helpers';
import {
  createFinanceGoal,
  createFinanceSubscription,
  insertFinanceTransaction,
} from '../../lib/finance/mutations';
import { finalizeQuickActionSuccess } from '../../lib/quickActions/finalize';
import { toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { TrackItIcon } from '../ui/TrackItIcon';
import type { TransactionType } from '../../types/finance';

type OperationKind = 'expense' | 'income' | 'subscription' | 'goal';

type FinanceMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  onAdvanced?: () => void;
  initialType?: TransactionType;
  initialAmount?: number;
  initialLabel?: string;
};

const OPERATION_IDS: OperationKind[] = ['expense', 'income', 'subscription', 'goal'];

export function FinanceMiniForm({
  onSuccess,
  onBack,
  onAdvanced,
  initialType = 'expense',
  initialAmount,
  initialLabel = '',
}: FinanceMiniFormProps) {
  const { t } = useTranslation();
  const { theme, text, surfaces } = useThemedStyles();
  const operations = OPERATION_IDS.map((id) => ({
    id,
    label:
      id === 'expense'
        ? t('common.expense')
        : id === 'income'
          ? t('common.income')
          : id === 'subscription'
            ? t('premium.subscription')
            : t('actionHub.actions.goal'),
  }));
  const { data } = useFinanceLiveData();
  const amountRef = useRef<TextInput>(null);
  const [operation, setOperation] = useState<OperationKind>(initialType === 'income' ? 'income' : 'expense');
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '');
  const [category, setCategory] = useState(initialType === 'income' ? 'salary' : 'food');
  const [label, setLabel] = useState(initialLabel);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addXpAction } = useGamification();

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isTransaction = operation === 'expense' || operation === 'income';

  const handleOperationChange = (next: OperationKind) => {
    setOperation(next);
    setError(null);
    if (next === 'income') {
      setType('income');
      setCategory('salary');
    } else if (next === 'expense') {
      setType('expense');
      setCategory('food');
    }
  };

  const handleSave = async () => {
    const parsedAmount = Number.parseFloat(amount.replace(',', '.'));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || isSubmitting) {
      setError(t('actionHub.forms.amountError'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const categoryDef = categories.find((c) => c.id === category) ?? categories[0];
    const resolvedLabel = label.trim() || tFinanceCategory(t, categoryDef.id, categoryDef.label);

    try {
      if (operation === 'subscription') {
        await createFinanceSubscription({ name: resolvedLabel, amount: parsedAmount });
        await addXpAction(60, 'finance_subscription');
      } else if (operation === 'goal') {
        await createFinanceGoal({ name: resolvedLabel, targetAmount: parsedAmount });
        await addXpAction(80, 'finance_goal');
      } else {
        await insertFinanceTransaction({
          type,
          amount: parsedAmount,
          category: categoryDef.id,
          label: resolvedLabel,
          accountId: data.accounts.find((a) => a.isDefault)?.id ?? data.accounts[0]?.id ?? null,
          note: note.trim() || undefined,
        });
        await addXpAction(100, 'finance_logged');
      }

      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.kicker, { color: theme.textMuted }]}>{t('actionHub.forms.quickFinance')}</Text>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>{t('actionHub.forms.logOperation')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {operations.map((item) => {
          const selected = operation === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleOperationChange(item.id)}
              style={[
                styles.categoryChip,
                { borderColor: theme.borderSubtle },
                selected && { borderColor: theme.primary, backgroundColor: `${theme.primary}18` },
              ]}
            >
              <Text style={{ color: selected ? theme.textPrimary : theme.textSecondary, fontWeight: '600' }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isTransaction ? (
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => {
              setOperation('expense');
              setType('expense');
              setCategory('food');
            }}
            style={[
              styles.toggleChip,
              { borderColor: theme.borderSubtle },
              type === 'expense' && { borderColor: theme.primary, backgroundColor: `${theme.primary}18` },
            ]}
          >
            <Text style={{ color: type === 'expense' ? theme.textPrimary : theme.textSecondary, fontWeight: '600' }}>
              {t('common.expense')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setOperation('income');
              setType('income');
              setCategory('salary');
            }}
            style={[
              styles.toggleChip,
              { borderColor: theme.borderSubtle },
              type === 'income' && { borderColor: theme.primary, backgroundColor: `${theme.primary}18` },
            ]}
          >
            <Text style={{ color: type === 'income' ? theme.textPrimary : theme.textSecondary, fontWeight: '600' }}>
              {t('common.income')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={[styles.label, { color: theme.textMuted }]}>
        {operation === 'goal' ? t('actionHub.forms.targetAmount') : t('actionHub.forms.amount')}
      </Text>
      <TextInput
        ref={amountRef}
        value={amount}
        onChangeText={setAmount}
        placeholder={t('actionHub.forms.amountPlaceholder')}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { borderColor: theme.borderSubtle, color: theme.textPrimary }]}
        keyboardType="decimal-pad"
        autoFocus
      />

      <Text style={[styles.label, { color: theme.textMuted }]}>
        {operation === 'subscription' ? t('actionHub.forms.labelPlaceholder') : operation === 'goal' ? t('actionHub.actions.goal') : t('actionHub.forms.labelPlaceholder')}
      </Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder={
          operation === 'subscription'
            ? t('actionHub.forms.subscriptionPlaceholder')
            : operation === 'goal'
              ? t('actionHub.forms.goalPlaceholder')
              : t('actionHub.forms.labelExample')
        }
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { borderColor: theme.borderSubtle, color: theme.textPrimary }]}
      />

      {isTransaction ? (
        <>
          <Text style={[styles.label, { color: theme.textMuted }]}>{t('actionHub.forms.category')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categories.map((item) => {
              const selected = category === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCategory(item.id)}
                  style={[
                    styles.categoryChip,
                    { borderColor: theme.borderSubtle },
                    selected && { borderColor: theme.primary, backgroundColor: `${theme.primary}18` },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TrackItIcon
                      name={item.icon}
                      size={14}
                      color={selected ? theme.primary : theme.textSecondary}
                    />
                    <Text style={{ color: selected ? theme.textPrimary : theme.textSecondary, fontWeight: '600' }}>
                      {tFinanceCategory(t, item.id, item.label)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { color: theme.textMuted }]}>
            {t('common.note')} ({t('common.optional')})
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('actionHub.forms.commentPlaceholder')}
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { borderColor: theme.borderSubtle, color: theme.textPrimary }]}
          />
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={onBack} style={[styles.secondaryButton, { borderColor: theme.borderSubtle }]}>
          <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>{t('actionHub.forms.back')}</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleSave()}
          disabled={isSubmitting}
          style={[styles.primaryButton, { backgroundColor: theme.primary }, isSubmitting && styles.disabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={surfaces.onPrimary} />
          ) : (
            <Text style={[text.onBrand, styles.primaryText]}>{t('actionHub.forms.save')}</Text>
          )}
        </Pressable>
      </View>

      {onAdvanced ? (
        <Pressable onPress={onAdvanced} style={styles.advancedButton}>
          <Text style={{ color: theme.textMuted, fontWeight: '600' }}>{t('actionHub.forms.openFinanceHub')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  heading: { fontSize: 22, fontWeight: '800', marginTop: 6, marginBottom: 18 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipRow: { gap: 8, paddingBottom: 16 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  error: { color: '#F87171', fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  disabled: { opacity: 0.55 },
  primaryText: { fontSize: 14, fontWeight: '700' },
  advancedButton: { alignItems: 'center', marginTop: 14, paddingVertical: 8 },
});
