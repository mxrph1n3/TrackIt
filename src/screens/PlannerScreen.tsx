import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JournalEditSheet } from '../components/planner/JournalEditSheet';
import { PlannerFinanceModule } from '../components/planner/PlannerFinanceModule';
import { PlannerMonthCalendar } from '../components/planner/PlannerMonthCalendar';
import { PlannerNutritionModule } from '../components/planner/PlannerNutritionModule';
import { PlannerScreenHeader } from '../components/planner/PlannerScreenHeader';
import { PlannerStatsModule } from '../components/planner/PlannerStatsModule';
import { PlannerTodayFocusCard } from '../components/planner/PlannerTodayFocusCard';
import { PlannerWorkoutModule } from '../components/planner/PlannerWorkoutModule';
import { PrioritizedTasksSection } from '../components/planner/PrioritizedTasksSection';
import { ProjectsTimelineSection } from '../components/planner/ProjectsTimelineSection';
import { usePlannerTheme } from '../hooks/usePlannerTheme';
import { usePlannerLiveData } from '../hooks/usePlannerLiveData';
import { useFloatingTabBarStyles } from '../navigation/hooks/useFloatingTabBarStyles';
import { useCreateHubStore } from '../stores/useCreateHubStore';
import { usePlannerNavigationStore } from '../stores/usePlannerNavigationStore';
import { usePlannerStore } from '../stores/usePlannerStore';
import { useSideDrawerStore } from '../stores/useSideDrawerStore';
import { BRAND } from '../theme/designTokens';
import { useTheme } from '../theme/ThemeContext';
import { AllTasksScreen } from './planner/AllTasksScreen';

export function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { styles: plannerStyles } = usePlannerTheme();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const openHub = useCreateHubStore((s) => s.open);
  const openDrawer = useSideDrawerStore((s) => s.open);
  const openAllTasks = usePlannerNavigationStore((s) => s.openAllTasks);
  const screen = usePlannerNavigationStore((s) => s.screen);
  const pendingTaskSeed = usePlannerNavigationStore((s) => s.pendingTaskSeed);
  const consumePendingTaskSeed = usePlannerNavigationStore((s) => s.consumePendingTaskSeed);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isJournalSheetOpen, setIsJournalSheetOpen] = useState(false);

  const {
    monthGrid,
    monthLabel,
    selectedDayKey,
    timelineDays,
    prioritizedTasks,
    projectTimelines,
    agenda,
    journalIsEmpty,
    selectDay,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentWeek,
    isLoading,
    toggleTask,
    toggleSubtask,
    toggleHabit,
    addSubtask,
    saveJournal,
    refresh,
  } = usePlannerLiveData();

  const openTaskSheet = useCallback(() => {
    usePlannerStore.getState().openTaskSheet(selectedDayKey);
  }, [selectedDayKey]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (!pendingTaskSeed) {
      return;
    }

    const seed = consumePendingTaskSeed();
    if (seed) {
      openTaskSheet();
    }
  }, [consumePendingTaskSeed, openTaskSheet, pendingTaskSeed]);

  const journalInitialBody = journalIsEmpty ? '' : agenda.journal.body;

  if (screen === 'allTasks') {
    return <AllTasksScreen />;
  }

  return (
    <View style={plannerStyles.screenRoot}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={BRAND.primary}
            colors={[BRAND.primary]}
          />
        }
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: scrollContentPaddingBottom,
          paddingHorizontal: 20,
        }}
      >
        <PlannerScreenHeader
          selectedDayKey={selectedDayKey}
          onMenuPress={openDrawer}
          onNotificationsPress={() => openHub()}
          onTodayPress={goToCurrentWeek}
        />

        <PlannerMonthCalendar
          monthLabel={monthLabel}
          weekdayLabels={monthGrid.weekdayLabels}
          days={monthGrid.days}
          onSelectDay={selectDay}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />

        {isLoading && prioritizedTasks.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={BRAND.primary} />
          </View>
        ) : (
          <Animated.View
            key={`planner-${selectedDayKey}`}
            entering={FadeInDown.duration(280)}
            exiting={FadeOutUp.duration(180)}
          >
            <PlannerTodayFocusCard
              agenda={agenda}
              isJournalEmpty={journalIsEmpty}
              onAddJournal={() => setIsJournalSheetOpen(true)}
              onEditJournal={() => setIsJournalSheetOpen(true)}
              onToggleHabit={(habitId) => void toggleHabit(habitId)}
            />

            <PrioritizedTasksSection
              tasks={prioritizedTasks}
              onToggleTask={(taskId) => void toggleTask(taskId)}
              onToggleSubtask={toggleSubtask}
              onAddSubtask={addSubtask}
              onAddTask={openTaskSheet}
              onViewAll={openAllTasks}
            />

            <PlannerWorkoutModule />
            <PlannerNutritionModule />
            <PlannerFinanceModule />
            <PlannerStatsModule />

            <ProjectsTimelineSection
              projects={projectTimelines}
              days={timelineDays}
              onViewAll={openAllTasks}
            />
          </Animated.View>
        )}
      </ScrollView>

      <JournalEditSheet
        visible={isJournalSheetOpen}
        initialBody={journalInitialBody}
        onClose={() => setIsJournalSheetOpen(false)}
        onSave={saveJournal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    paddingVertical: 32,
  },
});
