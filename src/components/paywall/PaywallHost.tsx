import { useEffect } from 'react';
import { BackHandler, Modal, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PremiumScreen } from '../../screens/PremiumScreen';
import { isAppFullyFree } from '../../constants/appAccess';
import { usePaywallStore } from '../../stores/usePaywallStore';
import { useTheme } from '../../theme/ThemeContext';
import { premiumQuickSpringConfig, premiumSpringConfig, timingEntrance, timingExit } from '../../theme/motion';

export function PaywallHost() {
  const { theme } = useTheme();
  const isOpen = usePaywallStore((s) => s.isOpen);
  const feature = usePaywallStore((s) => s.feature);
  const closePaywall = usePaywallStore((s) => s.closePaywall);
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      progress.value = withSpring(1, premiumSpringConfig);
      opacity.value = withTiming(1, timingEntrance());
      return;
    }

    progress.value = withSpring(0, premiumQuickSpringConfig);
    opacity.value = withTiming(0, timingExit());
  }, [isOpen, opacity, progress]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closePaywall();
      return true;
    });

    return () => subscription.remove();
  }, [closePaywall, isOpen]);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - progress.value) * 24 }],
  }));

  if (isAppFullyFree()) {
    return null;
  }

  return (
    <Modal visible={isOpen} animationType="none" transparent statusBarTranslucent onRequestClose={closePaywall}>
      <View style={[styles.backdrop, { backgroundColor: theme.drawerBackdrop }]}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.panel, { backgroundColor: theme.background }, panelStyle]}
        >
          <PremiumScreen feature={feature} onClose={closePaywall} showHeader={false} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  panel: {
    flex: 1,
  },
});
