import { useCallback, useState } from 'react';
import { RefreshControl, View } from 'react-native';

import { FinanceTipsCard } from '../components/finance/FinanceTipsCard';
import { BalanceHeroWidget } from '../components/finance/BalanceHeroWidget';
import { CategoryBreakdownSection } from '../components/finance/CategoryBreakdownSection';
import { ExpandableSection } from '../components/finance/ExpandableSection';
import { ExpensePieChart } from '../components/finance/ExpensePieChart';
import { FinanceBossTracker } from '../components/finance/FinanceBossTracker';
import {
  FinanceCashFlowCards,
  FinanceLastTransactionCard,
  FinanceQuickControlBar,
} from '../components/finance/FinanceRpgWidgets';
import { FinanceStatsSection } from '../components/finance/FinanceStatsSection';
import { FinanceTransactionSheet } from '../components/finance/FinanceTransactionSheet';
import { SavingsGoalsSection } from '../components/finance/SavingsGoalsSection';
import { SubscriptionsSection } from '../components/finance/SubscriptionsSection';
import { TransactionHistorySection } from '../components/finance/TransactionHistorySection';
import {
  IsolatedScreenShell,
  IsolatedScrollView,
} from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useAppSafeAreaInsets } from '../hooks/useAppSafeAreaInsets';
import { useFinanceLiveData } from '../hooks/useFinanceLiveData';
import { useProgression } from '../hooks/useProgression';
import { reportSyncError, reportSyncSuccess } from '../lib/sync/reportSyncError';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import type { TransactionType } from '../types/finance';
import { useTheme } from '../theme/ThemeContext';

export function FinanceScreen() {
  const { theme } = useTheme();
  const insets = useAppSafeAreaInsets();
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const { profileStats } = useProgression();
  const { data, refresh } = useFinanceLiveData();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [transactionSheet, setTransactionSheet] = useState<TransactionType | null>(null);

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    void refresh()
      .catch((error) => {
        reportSyncError('Finance', error, 'Could not refresh finances.');
      })
      .finally(() => {
        setIsPullRefreshing(false);
      });
  }, [refresh]);

  const handleTransactionSuccess = useCallback(() => {
    reportSyncSuccess('Transaction saved.');
    handleRefresh();
  }, [handleRefresh]);

  return (
    <IsolatedScreenShell>
      <ScreenHeader title="FINANCES" subtitle="Personal Wealth OS" onBack={closeModule} />

      <IsolatedScrollView
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <BalanceHeroWidget overview={data} cardholder={profileStats.username.toUpperCase()} />

        <FinanceCashFlowCards overview={data} />

        <FinanceStatsSection transactions={data.transactions} />

        {data.expenseCategories.length > 0 ? (
          <>
            <CategoryBreakdownSection
              categories={data.expenseCategories}
              onCategoryPress={(id) => setCategoryFilter(id)}
            />
            <ExpensePieChart data={data.expenseCategories} />
          </>
        ) : null}

        <FinanceBossTracker overview={data} />

        <FinanceLastTransactionCard overview={data} />

        <TransactionHistorySection
          transactions={data.transactions}
          categoryFilter={categoryFilter}
          onClearCategoryFilter={() => setCategoryFilter(null)}
        />

        <ExpandableSection title="Subscriptions" subtitle="Recurring payments">
          <SubscriptionsSection
            subscriptions={data.subscriptions}
            total={data.subscriptionsTotal}
            onCreated={handleRefresh}
          />
        </ExpandableSection>

        <ExpandableSection title="Savings Goals" subtitle="Boss roster">
          <SavingsGoalsSection goals={data.goals} onCreated={handleRefresh} />
        </ExpandableSection>

        <FinanceTipsCard tips={data.financeTips} />
      </IsolatedScrollView>

      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopWidth: 1,
          borderTopColor: `${theme.primary}18`,
          backgroundColor: theme.background,
        }}
      >
        <FinanceQuickControlBar
          onIncome={() => setTransactionSheet('income')}
          onExpense={() => setTransactionSheet('expense')}
        />
      </View>

      <FinanceTransactionSheet
        visible={transactionSheet !== null}
        type={transactionSheet ?? 'expense'}
        onClose={() => setTransactionSheet(null)}
        onSuccess={handleTransactionSuccess}
      />
    </IsolatedScreenShell>
  );
}
