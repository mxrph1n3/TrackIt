import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';

import { getDashboardTierTheme, tierCapsuleShadow } from '../../lib/dashboard/tierTheme';
import { MOTION_DURATION, timingLoop, timingProgress } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';
import type { DashboardProgress, ProgressCategory } from '../../types/dashboard';
import { GlassPanel } from '../GlassPanel';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const STROKE = 5;

type OverallProgressCardProps = {
  level: number;
  overallPercent: number;
  progress: DashboardProgress;
  isLoading?: boolean;
};

function TierCapsule({ level }: { level: number }) {
  const theme = getDashboardTierTheme(level);

  const label = (
    <Text
      style={[
        styles.tierLabel,
        { color: theme.useGoldGradient ? '#FFF7CC' : theme.primary },
      ]}
    >
      {theme.label}
    </Text>
  );

  if (theme.useGoldGradient) {
    return (
      <LinearGradient
        colors={['#FFD700', '#F59E0B', '#FFD700']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.tierCapsule, { borderColor: theme.capsuleBorder }, tierCapsuleShadow(theme)]}
      >
        {label}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.tierCapsule,
        {
          backgroundColor: theme.capsuleBackground,
          borderColor: theme.capsuleBorder,
        },
        tierCapsuleShadow(theme),
      ]}
    >
      {label}
    </View>
  );
}

function MetricRow({ category }: { category: ProgressCategory }) {
  const { theme } = useTheme();

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <View
          style={[
            styles.metricDot,
            { backgroundColor: category.color, shadowColor: category.color },
          ]}
        />
        <Text style={[styles.metricLabel, { color: theme.textPrimary }]} numberOfLines={1}>
          {category.label}
        </Text>
        <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{category.percent}%</Text>
      </View>
      <View style={[styles.metricTrack, { backgroundColor: theme.ringTrack }]}>
        <View
          style={[
            styles.metricFill,
            {
              width: `${Math.min(100, Math.max(0, category.percent))}%`,
              backgroundColor: category.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function MetricSkeletonRow() {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricDot, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        <View style={[styles.skeletonBlock, { width: 64, height: 11 }]} />
        <View style={[styles.skeletonBlock, { width: 28, height: 11 }]} />
      </View>
      <View style={[styles.skeletonBlock, styles.metricTrack, { height: 5 }]} />
    </View>
  );
}

function ProgressRing({
  ringSize,
  overallPercent,
  tierTheme,
  gradientId,
  sheenId,
  animatedRingProps,
  animatedSheenProps,
  radius,
  circumference,
}: {
  ringSize: number;
  overallPercent: number;
  tierTheme: ReturnType<typeof getDashboardTierTheme>;
  gradientId: string;
  sheenId: string;
  animatedRingProps: ReturnType<typeof useAnimatedProps>;
  animatedSheenProps: ReturnType<typeof useAnimatedProps>;
  radius: number;
  circumference: number;
}) {
  const { theme } = useTheme();
  const percentFontSize = overallPercent >= 100 ? 28 : 32;

  return (
    <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
      <View style={[styles.ringGlow, { width: ringSize + 16, height: ringSize + 16 }]} />

      <Svg width={ringSize} height={ringSize}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={tierTheme.highlight} />
            <Stop offset="30%" stopColor={tierTheme.primary} />
            <Stop offset="65%" stopColor={tierTheme.secondary} />
            <Stop offset="100%" stopColor={tierTheme.primary} />
          </SvgLinearGradient>
          <SvgLinearGradient id={sheenId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={tierTheme.sheen} stopOpacity={0.9} />
            <Stop offset="45%" stopColor="rgba(255,255,255,0)" stopOpacity={0} />
            <Stop offset="100%" stopColor={tierTheme.sheen} stopOpacity={0.35} />
          </SvgLinearGradient>
        </Defs>

        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={theme.ringTrack}
          strokeWidth={STROKE + 1}
          fill="transparent"
        />
        <AnimatedCircle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedRingProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${ringSize / 2}, ${ringSize / 2}`}
        />
        <AnimatedCircle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius - 0.5}
          stroke={`url(#${sheenId})`}
          strokeWidth={1.5}
          fill="transparent"
          strokeDasharray={`${circumference * 0.42} ${circumference}`}
          animatedProps={animatedSheenProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${ringSize / 2}, ${ringSize / 2}`}
          opacity={0.75}
        />
      </Svg>

      <View style={[styles.ringCenter, { width: ringSize, height: ringSize }]}>
        <Text
          style={[
            styles.ringPercent,
            { fontSize: percentFontSize, lineHeight: percentFontSize, color: theme.textPrimary },
          ]}
        >
          {overallPercent}%
        </Text>
        <Text style={[styles.ringCaption, { color: theme.textPrimary }]}>Complete</Text>
      </View>
    </View>
  );
}

function OverallProgressSkeleton({ ringSize }: { ringSize: number }) {
  const shimmer = useSharedValue(0.35);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(0.75, timingLoop(MOTION_DURATION.chart)),
      -1,
      true,
    );
  }, [shimmer]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <Animated.View style={[pulseStyle, styles.skeletonBlock, { height: 10, width: 120 }]} />
        <Animated.View style={[pulseStyle, styles.skeletonBlock, { height: 22, width: 56, borderRadius: 999 }]} />
      </View>

      <View style={styles.bodyRow}>
        <Animated.View
          style={[
            pulseStyle,
            styles.ringSkeleton,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
            },
          ]}
        />
        <View style={styles.metricsBlock}>
          <MetricSkeletonRow />
          <MetricSkeletonRow />
          <MetricSkeletonRow />
          <MetricSkeletonRow />
        </View>
      </View>
    </View>
  );
}

export function OverallProgressCard({
  level,
  overallPercent,
  progress,
  isLoading = false,
}: OverallProgressCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { theme } = useTheme();
  const ringSize = Math.min(Math.max(Math.round(windowWidth * 0.3), 104), 124);
  const tierTheme = getDashboardTierTheme(level);
  const radius = (ringSize - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const gradientId = 'dashboardProgressGradient';
  const sheenId = 'dashboardProgressSheen';

  const animatedOverall = useSharedValue(overallPercent);

  useEffect(() => {
    animatedOverall.value = withTiming(overallPercent, timingProgress());
  }, [animatedOverall, overallPercent]);

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedOverall.value / 100),
  }));

  const animatedSheenProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedOverall.value / 100),
  }));

  if (isLoading) {
    return (
      <GlassPanel borderRadius={26} style={{ marginBottom: 14 }}>
        <OverallProgressSkeleton ringSize={ringSize} />
      </GlassPanel>
    );
  }

  return (
    <GlassPanel borderRadius={26} style={{ marginBottom: 14 }}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Overall Progress</Text>
          <TierCapsule level={level} />
        </View>

        <View style={styles.bodyRow}>
          <View style={[styles.ringColumn, { width: ringSize }]}>
            <ProgressRing
              ringSize={ringSize}
              overallPercent={overallPercent}
              tierTheme={tierTheme}
              gradientId={gradientId}
              sheenId={sheenId}
              animatedRingProps={animatedRingProps}
              animatedSheenProps={animatedSheenProps}
              radius={radius}
              circumference={circumference}
            />
          </View>

          <View style={styles.metricsBlock}>
            {progress.categories.map((category) => (
              <MetricRow key={category.id} category={category} />
            ))}
          </View>
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 124,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  tierCapsule: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    flexShrink: 0,
  },
  tierLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  ringColumn: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGlow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontWeight: '900',
    letterSpacing: -1.5,
    transform: [{ scaleY: 1.2 }],
  },
  ringCaption: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    marginTop: 3,
    transform: [{ scaleY: 1.12 }],
  },
  ringSkeleton: {
    flexShrink: 0,
    borderWidth: STROKE,
    borderColor: 'rgba(139, 92, 246, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  metricsBlock: {
    flex: 1,
    minWidth: 0,
    gap: 10,
    justifyContent: 'center',
  },
  metricRow: {
    gap: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 4,
  },
  metricLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
    minWidth: 28,
    textAlign: 'right',
  },
  metricTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginLeft: 12,
  },
  metricFill: {
    height: '100%',
    borderRadius: 999,
  },
  skeletonBlock: {
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
