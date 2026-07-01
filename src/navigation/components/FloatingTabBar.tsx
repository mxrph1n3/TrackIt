import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { BarChart3, CalendarDays, Dumbbell, LayoutDashboard } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { QuickActionSheet } from '../../components/QuickActionSheet';
import { QuickCreateButton } from '../../components/QuickCreateButton';
import { ETHEREAL_COLORS } from '../../theme/etherealTokens';
import { premiumQuickSpringConfig, timingStandard } from '../../theme/motion';
import { routeExternalQuickAction } from '../../lib/quickActions/actionRouter';
import { useCreateHubStore } from '../../stores/useCreateHubStore';
import { useHealthStore } from '../../stores/useHealthStore';
import type { QuickActionId } from '../../types/quickActions';
import type { RootTabParamList } from '../types';
import { useFloatingTabBarStyles } from '../hooks/useFloatingTabBarStyles';

type TabItemConfig = {
  name: keyof RootTabParamList;
  icon: typeof LayoutDashboard;
};

const LEFT_TABS: TabItemConfig[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Planner', icon: CalendarDays },
];

const RIGHT_TABS: TabItemConfig[] = [
  { name: 'Health', icon: Dumbbell },
  { name: 'Analytics', icon: BarChart3 },
];

const INACTIVE_COLOR = '#7F7D9C';
const ACTIVE_COLOR = ETHEREAL_COLORS.neonActive;

type TabButtonProps = {
  tab: TabItemConfig;
  isFocused: boolean;
  onPress: () => void;
  buttonStyle: ViewStyle;
  iconSlotStyle: ViewStyle;
  activeDotStyle: ViewStyle;
  iconSize: number;
};

function TabButton({
  tab,
  isFocused,
  onPress,
  buttonStyle,
  iconSlotStyle,
  activeDotStyle,
  iconSize,
}: TabButtonProps) {
  const Icon = tab.icon;
  const focus = useSharedValue(isFocused ? 1 : 0);
  const scale = useSharedValue(isFocused ? 1.1 : 1);

  useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, timingStandard());
    scale.value = withSpring(isFocused ? 1.1 : 1, premiumQuickSpringConfig);
  }, [focus, isFocused, scale]);

  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.38 + focus.value * 0.62,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={tab.name}
      onPress={onPress}
      style={buttonStyle}
      className="active:opacity-80"
    >
      <View style={iconSlotStyle}>
        <Animated.View style={iconWrapStyle}>
          <Icon
            color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
            size={iconSize}
            strokeWidth={isFocused ? 1.6 : 1.15}
          />
        </Animated.View>
        {isFocused ? <View style={activeDotStyle} /> : null}
      </View>
    </Pressable>
  );
}

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const tabBar = useFloatingTabBarStyles();
  const activeSession = useHealthStore((s) => s.activeSession);
  const isWorkoutGoalPickerOpen = useHealthStore((s) => s.isWorkoutGoalPickerOpen);
  const hideForWorkout =
    isWorkoutGoalPickerOpen || Boolean(activeSession);
  const hubOpen = useCreateHubStore((s) => s.isOpen);
  const hubInitialAction = useCreateHubStore((s) => s.initialAction);
  const openHub = useCreateHubStore((s) => s.open);
  const closeHub = useCreateHubStore((s) => s.close);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [initialAction, setInitialAction] = useState<QuickActionId | null>(null);

  useEffect(() => {
    if (hubOpen) {
      setInitialAction(hubInitialAction);
      setIsSheetOpen(true);
    }
  }, [hubInitialAction, hubOpen]);

  const handleToggleSheet = useCallback(() => {
    if (isSheetOpen) {
      setIsSheetOpen(false);
      setInitialAction(null);
      closeHub();
      return;
    }
    openHub();
    setIsSheetOpen(true);
  }, [closeHub, isSheetOpen, openHub]);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    setInitialAction(null);
    closeHub();
  }, [closeHub]);

  const handleActionSelect = useCallback((actionId: QuickActionId) => {
    routeExternalQuickAction(actionId, handleCloseSheet);
  }, [handleCloseSheet]);

  const navigateToTab = useCallback(
    (routeName: keyof RootTabParamList) => {
      const routeIndex = state.routes.findIndex((route) => route.name === routeName);
      if (routeIndex < 0) return;

      const isFocused = state.index === routeIndex;
      const route = state.routes[routeIndex];

      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    },
    [navigation, state.index, state.routes],
  );

  return (
    <>
      <QuickActionSheet
        visible={isSheetOpen}
        onClose={handleCloseSheet}
        initialAction={initialAction}
        onInitialActionConsumed={() => setInitialAction(null)}
        onActionSelect={handleActionSelect}
      />

      {hideForWorkout ? null : (
      <View pointerEvents="box-none" style={tabBar.container}>
        <View style={tabBar.shell}>
          <BlurView
            intensity={tabBar.blurIntensity}
            tint={tabBar.blurTint}
            style={tabBar.styles.blurLayer}
          />
          <View style={tabBar.panel}>
            <View style={tabBar.row}>
              {LEFT_TABS.map((tab) => {
                const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
                return (
                  <TabButton
                    key={tab.name}
                    tab={tab}
                    isFocused={state.index === routeIndex}
                    onPress={() => navigateToTab(tab.name)}
                    buttonStyle={tabBar.tabButton}
                    iconSlotStyle={tabBar.styles.iconSlot}
                    activeDotStyle={tabBar.styles.activeDot}
                    iconSize={tabBar.iconSize}
                  />
                );
              })}

              <View style={tabBar.centerSlot} pointerEvents="none" />

              {RIGHT_TABS.map((tab) => {
                const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
                return (
                  <TabButton
                    key={tab.name}
                    tab={tab}
                    isFocused={state.index === routeIndex}
                    onPress={() => navigateToTab(tab.name)}
                    buttonStyle={tabBar.tabButton}
                    iconSlotStyle={tabBar.styles.iconSlot}
                    activeDotStyle={tabBar.styles.activeDot}
                    iconSize={tabBar.iconSize}
                  />
                );
              })}
            </View>
          </View>
        </View>

        <View pointerEvents="box-none" style={tabBar.fabAnchor}>
          <QuickCreateButton isOpen={isSheetOpen} onToggle={handleToggleSheet} />
        </View>
      </View>
      )}
    </>
  );
}
