import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { supportsNativeBlur } from '../../lib/platform/blur';
import { getActiveTabRoute } from '../../navigation/navigationRef';
import { useProfileStore } from '../../stores/useProfileStore';
import { useSideDrawerStore } from '../../stores/useSideDrawerStore';
import type { ProfileModuleId } from '../../types/profile';
import { useTheme } from '../../theme/ThemeContext';
import { drawerCloseSpring, drawerOpenSpring } from '../../theme/motion';
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

export function SideDrawer() {
  const insets = useAppSafeAreaInsets();
  const { theme } = useTheme();
  const isOpen = useSideDrawerStore((s) => s.isOpen);
  const close = useSideDrawerStore((s) => s.close);
  const setActiveModule = useProfileStore((s) => s.setActiveModule);

  const [mounted, setMounted] = useState(false);
  const progress = useSharedValue(0);
  const dragX = useSharedValue(0);

  const unmountDrawer = useCallback(() => {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      dragX.value = 0;
      progress.value = withSpring(1, drawerOpenSpring);

      const activeTab = getActiveTabRoute();
      const moduleId = activeTab ? TAB_ROUTE_TO_MODULE[activeTab] : undefined;
      if (moduleId) {
        setActiveModule(moduleId);
      }

      return;
    }

    if (!mounted) {
      return;
    }

    dragX.value = 0;
    progress.value = withSpring(0, drawerCloseSpring, (finished) => {
      if (finished) {
        runOnJS(unmountDrawer)();
      }
    });
  }, [dragX, isOpen, mounted, progress, setActiveModule, unmountDrawer]);

  const requestClose = useCallback(() => {
    close();
  }, [close]);

  const handleModulePress = useCallback(() => {
    close();
  }, [close]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        dragX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      const shouldClose = event.translationX < -DRAWER_WIDTH * 0.28 || event.velocityX < -500;
      if (shouldClose) {
        dragX.value = 0;
        runOnJS(requestClose)();
      } else {
        dragX.value = withSpring(0, drawerCloseSpring);
      }
    });

  const backdropStyle = useAnimatedStyle(() => {
    const dragFactor = interpolate(
      dragX.value,
      [-DRAWER_WIDTH, 0],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP) * dragFactor;
    return { opacity };
  });

  const panelStyle = useAnimatedStyle(() => {
    const baseTranslate = interpolate(
      progress.value,
      [0, 1],
      [-DRAWER_WIDTH, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: baseTranslate + dragX.value }],
    };
  });

  if (!mounted) {
    return null;
  }

  const panelBackground = supportsNativeBlur() ? theme.drawerPanel : theme.background;

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.drawerRoot]}>
      <Animated.View pointerEvents="none" style={[styles.backdrop, backdropStyle]}>
        {supportsNativeBlur() ? (
          <BlurView intensity={25} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[styles.backdropTint, { backgroundColor: theme.drawerBackdrop }]} />
      </Animated.View>

      <Animated.View pointerEvents="box-none" style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable
          style={[styles.dismissRegion, { left: DRAWER_WIDTH }]}
          accessibilityRole="button"
          accessibilityLabel="Close profile menu"
          onPress={requestClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            width: DRAWER_WIDTH,
            height: SCREEN_HEIGHT,
            paddingTop: insets.top,
            borderRightColor: theme.border,
            shadowColor: theme.shadowColor,
            shadowOpacity: theme.shadowOpacity + 0.02,
          },
          panelStyle,
        ]}
      >
        {supportsNativeBlur() ? (
          <BlurView
            pointerEvents="none"
            intensity={30}
            tint={theme.blurTint}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          pointerEvents="none"
          style={[styles.panelTint, { backgroundColor: panelBackground }]}
        />

        <GestureDetector gesture={panGesture}>
          <View style={styles.scrollHost}>
            <ScrollView
              style={styles.scroll}
              nestedScrollEnabled
              bounces
              alwaysBounceVertical
              overScrollMode="always"
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
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerRoot: {
    zIndex: DRAWER_Z_INDEX,
    elevation: DRAWER_Z_INDEX,
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
      ios: {
        shadowOffset: { width: 8, height: 0 },
        shadowRadius: 24,
      },
      android: {
        elevation: DRAWER_Z_INDEX + 2,
      },
    }),
  },
  panelTint: {
    ...StyleSheet.absoluteFill,
  },
  scrollHost: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
});
