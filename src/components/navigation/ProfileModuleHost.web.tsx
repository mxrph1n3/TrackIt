import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

import { AchievementsScreen } from '../../screens/AchievementsScreen';
import { FinanceScreen } from '../../screens/FinanceScreen';
import { FocusScreen } from '../../screens/FocusScreen';
import { HabitsScreen } from '../../screens/HabitsScreen';
import { JournalScreen } from '../../screens/JournalScreen';
import { MissionRoadmapScreen } from '../../screens/MissionRoadmapScreen';
import { PremiumScreen } from '../../screens/PremiumScreen';
import { QuotesScreen } from '../../screens/QuotesScreen';
import { SettingsScreen } from '../../screens/SettingsScreen';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
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

/** Web/TMA profile overlay — no Reanimated (avoids readonly style errors on RN Web). */
export function ProfileModuleHost() {
  const { theme } = useTheme();
  const activeModule = useProfileModuleStore((s) => s.activeModule);
  const closeModule = useProfileModuleStore((s) => s.closeModule);

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

  if (!activeModule) {
    return null;
  }

  const Screen = MODULE_SCREENS[activeModule];

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <View style={[StyleSheet.absoluteFill, styles.panel, { backgroundColor: theme.background }]}>
        <Screen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  panel: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});
