import { useCallback, useEffect } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { getActiveTabRoute } from '../../navigation/navigationRef';
import { useProfileStore } from '../../stores/useProfileStore';
import { useSideDrawerStore } from '../../stores/useSideDrawerStore';
import type { ProfileModuleId } from '../../types/profile';
import { useTheme } from '../../theme/ThemeContext';
import { LifeOsStatsRow } from '../profile/LifeOsStatsRow';
import { ProfileHero } from '../profile/ProfileHero';
import { ProfileNavMenu } from '../profile/ProfileNavMenu';

const TAB_ROUTE_TO_MODULE: Partial<Record<string, ProfileModuleId>> = {
  Dashboard: 'dashboard',
  Analytics: 'analytics',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.88, 340);
const DRAWER_Z_INDEX = 200;
const DRAWER_SCROLL_BOTTOM_PADDING = 72;

/** Web/TMA drawer — static layout (Reanimated style updates fail on RN Web). */
export function SideDrawer() {
  const insets = useAppSafeAreaInsets();
  const { theme } = useTheme();
  const isOpen = useSideDrawerStore((s) => s.isOpen);
  const close = useSideDrawerStore((s) => s.close);
  const setActiveModule = useProfileStore((s) => s.setActiveModule);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const activeTab = getActiveTabRoute();
    const moduleId = activeTab ? TAB_ROUTE_TO_MODULE[activeTab] : undefined;
    if (moduleId) {
      setActiveModule(moduleId);
    }
  }, [isOpen, setActiveModule]);

  const handleModulePress = useCallback(() => {
    close();
  }, [close]);

  if (!isOpen) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.drawerRoot]}>
      <View pointerEvents="none" style={styles.backdrop}>
        <View style={[styles.backdropTint, { backgroundColor: theme.drawerBackdrop }]} />
      </View>

      <Pressable
        style={[styles.dismissRegion, { left: DRAWER_WIDTH }]}
        accessibilityRole="button"
        accessibilityLabel="Close profile menu"
        onPress={close}
      />

      <View
        style={[
          styles.panel,
          {
            width: DRAWER_WIDTH,
            height: SCREEN_HEIGHT,
            paddingTop: insets.top,
            borderRightColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 4,
            paddingHorizontal: 12,
            paddingBottom: insets.bottom + DRAWER_SCROLL_BOTTOM_PADDING,
          }}
        >
          <ProfileHero />
          <LifeOsStatsRow variant="drawer" />
          <Text
            className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: theme.textMuted }}
          >
            Navigation
          </Text>
          <ProfileNavMenu onModulePress={handleModulePress} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerRoot: {
    zIndex: DRAWER_Z_INDEX,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: DRAWER_Z_INDEX,
  },
  backdropTint: {
    ...StyleSheet.absoluteFill,
  },
  dismissRegion: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: DRAWER_Z_INDEX + 1,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: DRAWER_Z_INDEX + 2,
    overflow: 'hidden',
    borderRightWidth: 1,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '8px 0 24px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  scroll: {
    flex: 1,
  },
});
