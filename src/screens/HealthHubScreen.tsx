import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useAppSafeAreaInsets } from '../hooks/useAppSafeAreaInsets';

import { HealthTabSwitcher } from '../components/health/HealthTabSwitcher';
import { HealthDateRibbon } from '../components/health/ui/HealthDateRibbon';
import { NutritionTabPanel } from '../components/health/NutritionTabPanel';
import { WorkoutsTabPanel } from '../components/health/WorkoutsTabPanel';
import { useHealthNavigation } from '../hooks/useHealthNavigation';
import { useHealthStyles } from '../hooks/useHealthStyles';
import { useFloatingTabBarStyles } from '../navigation/hooks/useFloatingTabBarStyles';
import { useSideDrawerStore } from '../stores/useSideDrawerStore';
import { useHealthHubNavigationStore } from '../stores/useHealthHubNavigationStore';
import { useHealthStore } from '../stores/useHealthStore';
import { getScreenHorizontalPadding } from '../theme/screenLayout';
import type { HealthTabId } from '../types/health';

function buildWeekDays(selectedIndex: number) {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    return {
      key: date.toISOString(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday,
      isSelected: index === selectedIndex,
    };
  });
}

export function HealthHubScreen() {
  const insets = useAppSafeAreaInsets();
  const openDrawer = useSideDrawerStore((s) => s.open);
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const { push } = useHealthNavigation();
  const [activeTab, setActiveTab] = useState<HealthTabId>('workouts');
  const consumeInitialHealthTab = useHealthHubNavigationStore((s) => s.consumeInitialHealthTab);
  const selectedDayIndex = useHealthStore((s) => s.selectedDayIndex);
  const selectDay = useHealthStore((s) => s.selectDay);
  const styles = useHealthStyles((t) => ({
    root: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scroll: {
      flex: 1,
    },
    nutritionHint: {
      marginTop: -12,
      marginBottom: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: 'rgba(119, 93, 216, 0.1)',
      backgroundColor: t.card,
    },
    nutritionHintWarning: {
      borderColor: 'rgba(245, 158, 11, 0.28)',
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
    },
    nutritionHintText: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 18,
      color: t.slate,
    },
    nutritionHintTextWarning: {
      color: t.ink,
    },
  }));

  useEffect(() => {
    const tab = consumeInitialHealthTab();
    if (tab) {
      setActiveTab(tab);
    }
  }, [consumeInitialHealthTab]);

  useEffect(() => {
    if (activeTab !== 'workouts') return;

    const { weeklyPlan, selectedDayIndex: currentIndex } = useHealthStore.getState();
    const todayIndex = weeklyPlan.findIndex((day) => day.isToday);
    if (todayIndex >= 0 && currentIndex !== todayIndex) {
      selectDay(todayIndex);
    }
  }, [activeTab, selectDay]);

  const weekDays = useMemo(() => buildWeekDays(selectedDayIndex), [selectedDayIndex]);
  const selectedDayIsToday = weekDays[selectedDayIndex]?.isToday ?? true;
  const horizontalPadding = getScreenHorizontalPadding();

  const handleTabChange = useCallback((tab: HealthTabId) => {
    setActiveTab(tab);
  }, []);

  const handleCalendarPress = useCallback(() => {
    if (activeTab === 'nutrition') {
      push('DailyProgress');
    }
  }, [activeTab, push]);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: scrollContentPaddingBottom,
          paddingHorizontal: horizontalPadding,
        }}
        nestedScrollEnabled
      >
        <HealthTabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCalendarPress={handleCalendarPress}
          onMenuPress={openDrawer}
        />

        {activeTab === 'nutrition' ? (
          <>
            <HealthDateRibbon
              days={weekDays}
              onSelect={(index) => selectDay(index)}
            />
            <View
              style={[
                styles.nutritionHint,
                !selectedDayIsToday && styles.nutritionHintWarning,
              ]}
            >
              <Text
                style={[
                  styles.nutritionHintText,
                  !selectedDayIsToday && styles.nutritionHintTextWarning,
                ]}
              >
                {selectedDayIsToday
                  ? 'Nutrition and water logs reflect today.'
                  : 'Day picker applies to workouts only — nutrition and water always show today.'}
              </Text>
            </View>
          </>
        ) : null}

        {activeTab === 'workouts' ? (
          Platform.OS !== 'ios' ? (
            <View key="workouts-tab">
              <WorkoutsTabPanel />
            </View>
          ) : (
            <Animated.View
              key="workouts-tab"
              entering={FadeInDown.duration(260)}
              exiting={FadeOutUp.duration(180)}
            >
              <WorkoutsTabPanel />
            </Animated.View>
          )
        ) : Platform.OS !== 'ios' ? (
          <View key="nutrition-tab">
            <NutritionTabPanel />
          </View>
        ) : (
          <Animated.View
            key="nutrition-tab"
            entering={FadeInDown.duration(260)}
            exiting={FadeOutUp.duration(180)}
          >
            <NutritionTabPanel />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
