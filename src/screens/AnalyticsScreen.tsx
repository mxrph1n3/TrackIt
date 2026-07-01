import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FinanceDonutChart, FinanceInsightCard } from '../components/analytics/FinancePanel';
import { HealthDualLineChart } from '../components/analytics/HealthPanel';
import { MetricTabSwitcher } from '../components/analytics/MetricTabSwitcher';
import { FocusHeatmap, TaskCompletionChart } from '../components/analytics/ProductivityPanel';
import { StatisticsOverviewHeader } from '../components/analytics/statistics/StatisticsOverviewHeader';
import { StatisticsOverviewPanel } from '../components/analytics/statistics/StatisticsOverviewPanel';
import { usePremiumAction } from '../hooks/useFeatureGate';
import { useFloatingTabBarStyles } from '../navigation/hooks/useFloatingTabBarStyles';
import { LeaderboardScreen } from './analytics/LeaderboardScreen';
import { useAnalyticsNavigationStore } from '../stores/useAnalyticsNavigationStore';
import { useSideDrawerStore } from '../stores/useSideDrawerStore';
import type { AnalyticsTabId } from '../types/analytics';

function AnalyticsScrollTab({ activeTab }: { activeTab: Exclude<AnalyticsTabId, 'overview'> }) {
  switch (activeTab) {
    case 'productivity':
      return (
        <>
          <FocusHeatmap />
          <TaskCompletionChart />
        </>
      );
    case 'finance':
      return (
        <>
          <FinanceDonutChart />
          <FinanceInsightCard />
        </>
      );
    case 'health':
      return <HealthDualLineChart />;
    default:
      return null;
  }
}

export function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const openDrawer = useSideDrawerStore((s) => s.open);
  const screen = useAnalyticsNavigationStore((s) => s.screen);
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>('overview');
  const bottomInset = scrollContentPaddingBottom;

  const requirePremium = usePremiumAction();

  const handleTabChange = useCallback(
    (tab: AnalyticsTabId) => {
      if (tab === 'overview') {
        setActiveTab(tab);
        return;
      }
      requirePremium('advanced_analytics', () => setActiveTab(tab));
    },
    [requirePremium],
  );

  if (screen === 'leaderboard') {
    return <LeaderboardScreen />;
  }

  return (
    <View style={[styles.screen, styles.screenTransparent]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: bottomInset,
          paddingHorizontal: 16,
        }}
      >
        <StatisticsOverviewHeader onMenuPress={openDrawer} />

        <MetricTabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'overview' ? <StatisticsOverviewPanel /> : <AnalyticsScrollTab activeTab={activeTab} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenTransparent: {
    backgroundColor: 'transparent',
  },
});
