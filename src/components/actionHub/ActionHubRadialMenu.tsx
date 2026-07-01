import { BlurView } from 'expo-blur';
import { useEffect, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import type { RadialHubAction } from '../../constants/actionHubRadial';
import { premiumSpringConfig, timingEntrance, timingExit } from '../../theme/motion';
import { ActionHubCenterCrystal } from './ActionHubCenterCrystal';
import { ACTION_HUB } from './actionHubTheme';
import { useActionHubTheme } from './useActionHubTheme';

const HUB_SIZE = 440;
const CENTER = HUB_SIZE / 2;
const ORBIT_RADIUS = 178;
const ORB_SIZE = 68;
const ORB_ANCHOR_WIDTH = 118;
const CRYSTAL_SIZE = 108;

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

type ActionHubRadialMenuProps = {
  actions: RadialHubAction[];
  visible: boolean;
  layoutScale?: number;
  onActionPress: (action: RadialHubAction) => void;
  onCrystalPress: () => void;
};

function RadialOrb({
  action,
  visible,
  delayMs,
  onPress,
}: {
  action: RadialHubAction;
  visible: boolean;
  delayMs: number;
  onPress: () => void;
}) {
  const hubTheme = useActionHubTheme();
  const position = polar(action.angle, ORBIT_RADIUS);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const Icon = action.icon;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        orbAnchor: {
          position: 'absolute',
          alignItems: 'center',
        },
        orbPressable: {
          alignItems: 'center',
          width: ORB_ANCHOR_WIDTH,
        },
        orbShell: {
          width: ORB_SIZE,
          height: ORB_SIZE,
          borderRadius: ORB_SIZE / 2,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: hubTheme.glassBorder,
          backgroundColor: hubTheme.orbBg,
          shadowColor: '#775DD8',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: hubTheme.shadowOpacity,
          shadowRadius: 14,
          elevation: 4,
        },
        orbLabel: {
          marginTop: 8,
          width: ORB_ANCHOR_WIDTH,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: '800',
          color: hubTheme.ink,
          letterSpacing: 0.2,
          lineHeight: 13,
        },
      }),
    [hubTheme],
  );

  useEffect(() => {
    if (visible) {
      scale.value = withDelay(delayMs, withSpring(1, premiumSpringConfig));
      opacity.value = withDelay(
        delayMs,
        withTiming(1, timingEntrance(ACTION_HUB.openDurationMs)),
      );
      return;
    }
    scale.value = withTiming(0.6, timingExit(ACTION_HUB.closeDurationMs));
    opacity.value = withTiming(0, timingExit(ACTION_HUB.closeDurationMs));
  }, [delayMs, opacity, scale, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const left = position.x - ORB_ANCHOR_WIDTH / 2;
  const top = position.y - ORB_SIZE / 2;

  return (
    <Animated.View style={[styles.orbAnchor, { left, top, width: ORB_ANCHOR_WIDTH }, animatedStyle]}>
      <Pressable onPress={onPress} style={styles.orbPressable}>
        <View style={styles.orbShell}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={hubTheme.isDark ? 32 : 24} tint={hubTheme.blurTint} style={StyleSheet.absoluteFill} />
          ) : null}
          <Icon color={action.accent} size={22} strokeWidth={2} />
        </View>
        <Text style={styles.orbLabel} numberOfLines={1}>
          {action.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function ActionHubRadialMenu({
  actions,
  visible,
  layoutScale = 1,
  onActionPress,
  onCrystalPress,
}: ActionHubRadialMenuProps) {
  const hubTheme = useActionHubTheme();
  const hubScale = useSharedValue(0.88);
  const scaledSize = HUB_SIZE * layoutScale;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        outer: {
          alignSelf: 'center',
          overflow: 'visible',
          marginBottom: 4,
        },
        centerSlot: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        },
        ringPlate: {
          width: HUB_SIZE,
          height: HUB_SIZE,
        },
        lines: {
          position: 'absolute',
          left: 0,
          top: 0,
        },
        crystalWrap: {
          position: 'absolute',
          left: CENTER - CRYSTAL_SIZE / 2 + ACTION_HUB.crystalNudgeX,
          top: CENTER - CRYSTAL_SIZE / 2 + ACTION_HUB.crystalNudgeY,
          width: CRYSTAL_SIZE,
          height: CRYSTAL_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        },
      }),
    [],
  );

  useEffect(() => {
    hubScale.value = visible
      ? withTiming(1, timingEntrance(ACTION_HUB.openDurationMs))
      : withTiming(0.88, timingExit(ACTION_HUB.closeDurationMs));
  }, [hubScale, visible]);

  const hubAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: hubScale.value * layoutScale }],
  }));

  return (
    <View style={[styles.outer, { width: scaledSize, height: scaledSize }]}>
      <View style={styles.centerSlot}>
        <Animated.View style={[styles.ringPlate, hubAnimatedStyle]}>
          <Svg width={HUB_SIZE} height={HUB_SIZE} style={styles.lines}>
            {actions.map((action) => {
              const point = polar(action.angle, ORBIT_RADIUS);
              return (
                <Line
                  key={`line-${action.key}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={point.x}
                  y2={point.y}
                  stroke={hubTheme.lineStroke}
                  strokeWidth={1}
                />
              );
            })}
          </Svg>

          <View style={styles.crystalWrap} pointerEvents="box-none">
            <ActionHubCenterCrystal onPress={onCrystalPress} size={CRYSTAL_SIZE} />
          </View>

          {actions.map((action, index) => (
            <RadialOrb
              key={action.key}
              action={action}
              visible={visible}
              delayMs={30 + index * 20}
              onPress={() => onActionPress(action)}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
