import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { PaywallHost } from '../components/paywall/PaywallHost';
import { FinanceTransactionHost } from '../components/finance/FinanceTransactionHost';
import { TaskCreationHost } from '../components/planner/TaskCreationHost';
import { NutritionSyncBridge } from '../hooks/useHealthNutritionSync';
import { SideDrawer } from '../components/navigation/SideDrawer';
import { ProfileModuleHost } from '../components/navigation/ProfileModuleHost';
import { SchemaStatusBanner } from '../components/system/SchemaStatusBanner';
import { ToastHost } from '../components/system/ToastHost';
import { WorkoutSessionHost } from '../components/health/WorkoutSessionHost';
import { ScreenAmbientBackground } from '../components/ui/ScreenAmbientBackground';
import { TelegramBackButtonSync } from '../components/telegram/TelegramBackButtonSync';
import { useCatalogSync } from '../hooks/useCatalogSync';
import { useNotificationDeepLinks } from '../hooks/useNotificationDeepLinks';
import { useReminderNotifications } from '../hooks/useReminderNotifications';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlannerScreen } from '../screens/PlannerScreen';
import { useHealthHubNavigationStore } from '../stores/useHealthHubNavigationStore';
import { useTheme } from '../theme/ThemeContext';
import { FloatingTabBar } from './components/FloatingTabBar';
import { HealthStackNavigator } from './HealthStackNavigator';
import { linking } from './linking';
import { navigationRef, navigateHealthScreen } from './navigationRef';
import type { RootTabParamList } from './types';

export type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function HealthPendingRouteBridge() {
  const pendingRoute = useHealthHubNavigationStore((state) => state.pendingRoute);

  useEffect(() => {
    if (!pendingRoute || !navigationRef.isReady()) {
      return;
    }

    const route = useHealthHubNavigationStore.getState().consumePendingRoute();
    if (!route) {
      return;
    }

    navigateHealthScreen(route.screen, route.params);
  }, [pendingRoute]);

  return null;
}

function TabNavigatorShell() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        freezeOnBlur: Platform.OS === 'ios',
        ...(Platform.OS === 'web' ? { animation: 'fade' as const } : {}),
        sceneStyle: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Health" component={HealthStackNavigator} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { mode } = useTheme();
  const [navigationReady, setNavigationReady] = useState(false);
  useCatalogSync();
  useNotificationDeepLinks();
  useReminderNotifications();

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => setNavigationReady(true)}
    >
      <View style={styles.shell}>
        <View style={styles.backgroundLayer} pointerEvents="none">
          <ScreenAmbientBackground mode={mode} />
        </View>
        <View style={styles.contentLayer}>
          <TabNavigatorShell />
          <HealthPendingRouteBridge />
          <SchemaStatusBanner />
          <ToastHost />
          <SideDrawer />
          <ProfileModuleHost />
          <PaywallHost />
          <WorkoutSessionHost />
          <TaskCreationHost />
          <FinanceTransactionHost />
          <NutritionSyncBridge />
          <TelegramBackButtonSync navigationReady={navigationReady} />
        </View>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  contentLayer: {
    flex: 1,
    zIndex: 1,
  },
});
