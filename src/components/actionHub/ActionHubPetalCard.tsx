import { BlurView } from 'expo-blur';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { premiumSpringConfig, timingEntrance, timingExit } from '../../theme/motion';
import { supportsNativeBlur } from '../../lib/platform/blur';
import { ACTION_HUB } from './actionHubTheme';
import { useActionHubTheme } from './useActionHubTheme';

type ActionHubPetalCardProps = {
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
  delayMs: number;
  visible: boolean;
  width?: number;
  onPress: () => void;
};

export function ActionHubPetalCard({
  title,
  subtitle,
  accent,
  icon: Icon,
  delayMs,
  visible,
  width = ACTION_HUB.petalWidth,
  onPress,
}: ActionHubPetalCardProps) {
  const hubTheme = useActionHubTheme();
  const translateY = useSharedValue(28);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          height: ACTION_HUB.petalHeight,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: hubTheme.glassEdge,
          backgroundColor: hubTheme.panelBg,
          shadowColor: '#775DD8',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: hubTheme.shadowOpacity,
          shadowRadius: 18,
          elevation: 4,
        },
        shellPressed: {
          opacity: 0.94,
        },
        inner: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          gap: 12,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
        },
        copy: {
          flex: 1,
        },
        title: {
          fontSize: 15,
          fontWeight: '800',
          color: hubTheme.ink,
          letterSpacing: -0.2,
        },
        subtitle: {
          marginTop: 2,
          fontSize: 12,
          fontWeight: '500',
          color: hubTheme.subtitle,
        },
      }),
    [hubTheme],
  );

  useEffect(() => {
    if (visible) {
      translateY.value = withDelay(delayMs, withSpring(0, premiumSpringConfig));
      opacity.value = withDelay(
        delayMs,
        withTiming(1, timingEntrance(ACTION_HUB.openDurationMs)),
      );
      return;
    }

    translateY.value = withTiming(18, timingExit(ACTION_HUB.closeDurationMs));
    opacity.value = withTiming(0, timingExit(ACTION_HUB.closeDurationMs));
  }, [delayMs, opacity, translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(1.03, premiumSpringConfig);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, premiumSpringConfig);
        }}
        style={({ pressed }) => [styles.shell, pressed && styles.shellPressed]}
      >
        {supportsNativeBlur() ? (
          <BlurView intensity={hubTheme.isDark ? 36 : 28} tint={hubTheme.blurTint} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.inner}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
            <Icon color={accent} size={20} strokeWidth={1.8} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
