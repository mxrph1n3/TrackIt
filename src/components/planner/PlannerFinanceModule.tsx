import { TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatMoneyCompact } from '../../constants/financeCategories';
import { useDashboardFinance } from '../../hooks/useDashboardFinance';
import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
import { BRAND, SEMANTIC } from '../../theme/designTokens';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PLANNER_COPY } from './plannerTheme';

export function PlannerFinanceModule() {
  const { finance, isLoading } = useDashboardFinance();
  const { styles: plannerStyles, theme, surfaces } = usePlannerTheme();
  const openFinance = useProfileModuleStore((s) => s.openModule);
  const styles = useMemo(
    () =>
      StyleSheet.create({
        loader: {
          marginVertical: 12,
        },
        balance: {
          fontSize: 28,
          fontWeight: '900',
          letterSpacing: -0.8,
          color: theme.textPrimary,
        },
        balanceCaption: {
          marginTop: 4,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
        },
        flowRow: {
          flexDirection: 'row',
          gap: 10,
          marginTop: 14,
        },
        flowPill: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
        },
        incomePill: {
          borderColor: 'rgba(52, 211, 153, 0.2)',
          backgroundColor: 'rgba(52, 211, 153, 0.08)',
        },
        expensePill: {
          borderColor: 'rgba(248, 113, 113, 0.2)',
          backgroundColor: 'rgba(248, 113, 113, 0.08)',
        },
        flowLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        flowValue: {
          marginTop: 2,
          fontSize: 13,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        metaRow: {
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 14,
          backgroundColor: surfaces.inset,
          borderWidth: 1,
          borderColor: surfaces.border,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        metaText: {
          flex: 1,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textSecondary,
        },
      }),
    [surfaces, theme],
  );

  const handleOpen = () => {
    openFinance('finance');
  };

  const flowSubtitle =
    finance.monthlyIncome > 0 || finance.monthlyExpense > 0
      ? `${formatMoneyCompact(finance.monthlyIncome, finance.displayCurrency)} in · ${formatMoneyCompact(finance.monthlyExpense, finance.displayCurrency)} out`
      : 'No activity this month';

  return (
    <Pressable onPress={handleOpen}>
      <PlannerPremiumCard>
        <View style={plannerStyles.moduleInner}>
          <PlannerSectionHeader
            title={PLANNER_COPY.finance}
            subtitle={flowSubtitle}
            actionLabel={PLANNER_COPY.open}
            onAction={handleOpen}
          />

          {isLoading ? (
            <ActivityIndicator color={BRAND.primary} style={styles.loader} />
          ) : (
            <>
              <Text style={styles.balance}>
                {formatMoneyCompact(finance.balance, finance.displayCurrency)}
              </Text>
              <Text style={styles.balanceCaption}>Balance · {finance.cardholder}</Text>

              <View style={styles.flowRow}>
                <FlowPill
                  icon={<TrendingUp color={SEMANTIC.income} size={14} />}
                  label="Income"
                  value={formatMoneyCompact(finance.monthlyIncome, finance.displayCurrency)}
                  tone="income"
                  styles={styles}
                />
                <FlowPill
                  icon={<TrendingDown color={SEMANTIC.expenseSoft} size={14} />}
                  label="Expense"
                  value={formatMoneyCompact(finance.monthlyExpense, finance.displayCurrency)}
                  tone="expense"
                  styles={styles}
                />
              </View>

              {finance.activeGoal ? (
                <View style={styles.metaRow}>
                  <Wallet color={BRAND.primary} size={16} />
                  <Text style={styles.metaText}>
                    Goal {finance.activeGoal.name} · {finance.activeGoal.percent}%
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      </PlannerPremiumCard>
    </Pressable>
  );
}

function FlowPill({
  icon,
  label,
  value,
  tone,
  styles,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'income' | 'expense';
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={[styles.flowPill, tone === 'income' ? styles.incomePill : styles.expensePill]}>
      {icon}
      <View>
        <Text style={styles.flowLabel}>{label}</Text>
        <Text style={styles.flowValue}>{value}</Text>
      </View>
    </View>
  );
}
