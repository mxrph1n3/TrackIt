import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { timingProgress } from '../../../theme/motion';

type HealthProgressBarProps = {
  progress: number;
  label?: string;
  meta?: string;
  color?: string;
  height?: number;
};

export function HealthProgressBar({
  progress,
  label,
  meta,
  color,
  height = 8,
}: HealthProgressBarProps) {
  const healthTheme = useHealthTheme();
  const resolvedColor = color ?? healthTheme.accent;
  const clamped = Math.min(100, Math.max(0, progress));
  const width = useSharedValue(0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        },
        label: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: healthTheme.slate,
        },
        meta: {
          fontSize: 13,
          fontWeight: '600',
          color: healthTheme.ink,
        },
        track: {
          backgroundColor: healthTheme.accentSoft,
          overflow: 'hidden',
        },
        fill: {
          height: '100%',
        },
      }),
    [healthTheme],
  );

  useEffect(() => {
    width.value = withTiming(clamped, timingProgress());
  }, [clamped, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View>
      {label || meta ? (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: resolvedColor, borderRadius: height / 2 }, fillStyle]}
        />
      </View>
    </View>
  );
}
