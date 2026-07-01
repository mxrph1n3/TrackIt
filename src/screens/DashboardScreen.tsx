import { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DashboardFinanceCard } from '../components/dashboard/DashboardFinanceCard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardHealthCard } from '../components/dashboard/DashboardHealthCard';
import { FocusStreakCard } from '../components/dashboard/FocusStreakCard';
import { OverallProgressCard } from '../components/dashboard/OverallProgressCard';
import { TodaysScheduleCard } from '../components/dashboard/TodaysScheduleCard';
import { useDashboardLiveData } from '../hooks/useDashboardLiveData';
import { useFloatingTabBarStyles } from '../navigation/hooks/useFloatingTabBarStyles';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useSideDrawerStore } from '../stores/useSideDrawerStore';

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const openDrawer = useSideDrawerStore((s) => s.open);
  const openSettings = useProfileModuleStore((s) => s.openModule);

  const {
    isLoading,
    level,
    overallPercent,
    progress,
    schedule,
    scheduleIsEmpty,
    focusStreakDays,
    focusCrystalActive,
    finance,
    isFreshUser,
    refresh,
    toggleScheduleItem,
  } = useDashboardLiveData();

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-gutter"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: scrollContentPaddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#775DD8"
            title="Syncing profile..."
            titleColor="#7F7D9C"
          />
        }
      >
        <DashboardHeader
          onMenuPress={openDrawer}
          onFilterPress={() => openSettings('settings')}
        />

        <OverallProgressCard
          level={level}
          overallPercent={overallPercent}
          progress={progress}
          isLoading={isLoading}
        />

        <TodaysScheduleCard
          schedule={schedule}
          isEmpty={scheduleIsEmpty}
          onToggleItem={(id) => {
            void toggleScheduleItem(id);
          }}
        />

        <FocusStreakCard streakDays={focusStreakDays} crystalActive={focusCrystalActive} />

        <DashboardHealthCard />

        <DashboardFinanceCard finance={finance} isFreshUser={isFreshUser} />
      </ScrollView>
    </View>
  );
}
