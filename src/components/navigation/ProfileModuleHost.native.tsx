import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AchievementsScreen } from '../../screens/AchievementsScreen';
import { FinanceScreen } from '../../screens/FinanceScreen';
import { FocusScreen } from '../../screens/FocusScreen';
import { HabitsScreen } from '../../screens/HabitsScreen';
import { JournalScreen } from '../../screens/JournalScreen';
import { MissionRoadmapScreen } from '../../screens/MissionRoadmapScreen';
import { PremiumScreen } from '../../screens/PremiumScreen';
import { QuotesScreen } from '../../screens/QuotesScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';
import { isAppFullyFree } from '../../constants/appAccess';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
import { premiumQuickSpringConfig, premiumSpringConfig, timingEntrance, timingExit } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';

const MODULE_SCREENS = {
  habits: HabitsScreen,
  focus: FocusScreen,
  finance: FinanceScreen,
  achievements: AchievementsScreen,
  settings: SettingsScreen,
  journal: JournalScreen,
  mission: MissionRoadmapScreen,
  quotes: QuotesScreen,
  premium: PremiumScreen,
} as const;

export function ProfileModuleHost() {
  const { theme } = useTheme();
  const activeModule = useProfileModuleStore((s) => s.activeModule);
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (activeModule) {
      progress.value = withSpring(1, premiumSpringConfig);
      opacity.value = withTiming(1, timingEntrance());
      return;
    }

    progress.value = withSpring(0, premiumQuickSpringConfig);
    opacity.value = withTiming(0, timingExit());
  }, [activeModule, opacity, progress]);

  useEffect(() => {
    if (!activeModule) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeModule();
      return true;
    });

    return () => subscription.remove();
  }, [activeModule, closeModule]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: (1 - progress.value) * 24 }],
  }));

  if (!activeModule) {
    return null;
  }

  if (activeModule === 'premium' && isAppFullyFree()) {
    return null;
  }

  const Screen = MODULE_SCREENS[activeModule];

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.panel,
          { backgroundColor: theme.background },
          panelStyle,
        ]}
      >
        <Screen />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
  },
  panel: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
