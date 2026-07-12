import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { supportsNativeBlur } from '../../lib/platform/blur';
import { useTheme } from '../../theme/ThemeContext';
import { timingLoop } from '../../theme/motion';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const BLOB_BLUR_RADIUS = 90;

type BlobSpec = {
  id: string;
  color: string;
  size: number;
  left: number;
  top: number;
  driftX: number;
  driftY: number;
  durationX: number;
  durationY: number;
  durationScale: number;
  phaseDelay: number;
};

const LIGHT_BLOBS: BlobSpec[] = [
  {
    id: 'ambient-a',
    color: '#E2D9FF',
    size: SCREEN_W * 1.05,
    left: -SCREEN_W * 0.32,
    top: -SCREEN_H * 0.14,
    driftX: 40,
    driftY: -36,
    durationX: 15_500,
    durationY: 18_500,
    durationScale: 20_000,
    phaseDelay: 0,
  },
  {
    id: 'violet-a',
    color: '#775DD8',
    size: SCREEN_W * 0.86,
    left: SCREEN_W * 0.38,
    top: SCREEN_H * 0.48,
    driftX: -36,
    driftY: 42,
    durationX: 17_000,
    durationY: 14_500,
    durationScale: 22_000,
    phaseDelay: 1_100,
  },
  {
    id: 'ambient-b',
    color: '#C9BBFF',
    size: SCREEN_W * 0.94,
    left: SCREEN_W * 0.04,
    top: SCREEN_H * 0.22,
    driftX: 32,
    driftY: 38,
    durationX: 19_000,
    durationY: 16_000,
    durationScale: 18_500,
    phaseDelay: 2_200,
  },
];

const DARK_BLOBS: BlobSpec[] = [
  {
    id: 'violet-a',
    color: '#775DD8',
    size: SCREEN_W * 1.1,
    left: -SCREEN_W * 0.35,
    top: -SCREEN_H * 0.12,
    driftX: 28,
    driftY: -24,
    durationX: 16_000,
    durationY: 19_000,
    durationScale: 21_000,
    phaseDelay: 0,
  },
  {
    id: 'violet-b',
    color: '#4C1D95',
    size: SCREEN_W * 0.9,
    left: SCREEN_W * 0.35,
    top: SCREEN_H * 0.5,
    driftX: -30,
    driftY: 36,
    durationX: 18_000,
    durationY: 15_000,
    durationScale: 23_000,
    phaseDelay: 900,
  },
];

type NeonBlobProps = {
  spec: BlobSpec;
  blurTint: 'light' | 'dark';
};

function NeonBlob({ spec, blurTint }: NeonBlobProps) {
  const driftX = useSharedValue(0);
  const driftY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const start = () => {
      driftX.value = withRepeat(
        withSequence(
          withTiming(spec.driftX, timingLoop(spec.durationX)),
          withTiming(-spec.driftX, timingLoop(spec.durationX)),
        ),
        -1,
        true,
      );
      driftY.value = withRepeat(
        withSequence(
          withTiming(spec.driftY, timingLoop(spec.durationY)),
          withTiming(-spec.driftY, timingLoop(spec.durationY)),
        ),
        -1,
        true,
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, timingLoop(spec.durationScale)),
          withTiming(0.94, timingLoop(spec.durationScale)),
        ),
        -1,
        true,
      );
    };

    const timer = setTimeout(start, spec.phaseDelay);
    return () => clearTimeout(timer);
  }, [driftX, driftY, scale, spec]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: driftX.value },
      { translateY: driftY.value },
      { scale: scale.value },
    ],
  }));

  const radius = spec.size / 2;
  const gradientId = `blob-${spec.id}`;

  return (
    <Animated.View
      style={[
        styles.blob,
        animatedStyle,
        {
          width: spec.size,
          height: spec.size,
          left: spec.left,
          top: spec.top,
        },
      ]}
    >
      <Svg width={spec.size} height={spec.size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={spec.color} stopOpacity={blurTint === 'dark' ? 0.28 : 0.3} />
            <Stop offset="35%" stopColor={spec.color} stopOpacity={0.12} />
            <Stop offset="70%" stopColor={spec.color} stopOpacity={0.04} />
            <Stop offset="100%" stopColor={spec.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill={`url(#${gradientId})`} />
      </Svg>

      {supportsNativeBlur() ? (
        <BlurView
          intensity={Math.min(100, Math.round(BLOB_BLUR_RADIUS * 0.45))}
          tint={blurTint}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
    </Animated.View>
  );
}

export function AmbientBackground() {
  const { theme, isDark } = useTheme();
  const blobs = isDark ? DARK_BLOBS : LIGHT_BLOBS;

  return (
    <View pointerEvents="none" style={[styles.root, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.lavenderMist, theme.background, theme.backgroundEnd]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {blobs.map((spec) => (
        <NeonBlob key={spec.id} spec={spec} blurTint={theme.blurTint} />
      ))}

      <LinearGradient
        colors={
          isDark
            ? ['rgba(127,0,255,0.08)', 'rgba(7,7,10,0.35)', 'rgba(7,7,10,0.92)']
            : ['rgba(255,255,255,0.12)', 'rgba(243,245,250,0.35)', 'rgba(255,255,255,0.88)']
        }
        locations={[0, 0.55, 1]}
        style={styles.vignette}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    overflow: 'hidden',
  },
  vignette: {
    ...StyleSheet.absoluteFill,
  },
});

export { BLOB_BLUR_RADIUS };
