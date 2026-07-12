import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import type { GrowthPoint } from '../../../types/statisticsOverview';
import { BRAND } from '../../../theme/designTokens';
import { useTheme } from '../../../theme/ThemeContext';
import { MOTION_DURATION, timingEntrance } from '../../../theme/motion';
import { StatisticsCardBlur, StatisticsPremiumCard } from './StatisticsPremiumCard';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const PAD = { top: 12, right: 8, bottom: 24, left: 8 };

function buildPoints(values: number[]) {
  const innerW = CHART_WIDTH - PAD.left - PAD.right;
  const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const max = 100;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: PAD.left + step * index,
    y: PAD.top + innerH - (value / max) * innerH,
    value,
  }));
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  return points.reduce(
    (path, point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`),
    '',
  );
}

function buildAreaPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  const baseline = CHART_HEIGHT - PAD.bottom;
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

export function OverallGrowthCard({
  percent,
  rangeLabel,
  series,
}: {
  percent: number;
  rangeLabel: string;
  series: GrowthPoint[];
}) {
  const { theme, isDark } = useTheme();
  const progress = useSharedValue(0);
  const points = buildPoints(series.map((item) => item.value));
  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points);
  const pathLength = 420;

  useEffect(() => {
    progress.value = withTiming(1, timingEntrance(MOTION_DURATION.chart));
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  const animatedFillProps = useAnimatedProps(() => ({
    opacity: progress.value * 0.35,
  }));

  const useStaticChart = Platform.OS !== 'ios';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        },
        kicker: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: theme.textPrimary,
        },
        range: {
          marginTop: 4,
          fontSize: 11,
          fontWeight: '500',
          color: theme.textMuted,
        },
        percent: {
          fontSize: 32,
          fontWeight: '900',
          letterSpacing: -1,
          color: BRAND.primary,
        },
        chart: {
          alignSelf: 'center',
        },
      }),
    [theme],
  );

  return (
    <StatisticsPremiumCard>
      <StatisticsCardBlur />
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Overall Growth</Text>
          <Text style={styles.range}>{rangeLabel}</Text>
        </View>
        <Text style={styles.percent}>{percent}%</Text>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
        <Defs>
          <LinearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={BRAND.primary} stopOpacity={0.28} />
            <Stop offset="100%" stopColor={BRAND.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {useStaticChart ? (
          <>
            <Path d={areaPath} fill="url(#growthFill)" opacity={0.35} />
            <Path
              d={linePath}
              fill="none"
              stroke={BRAND.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <AnimatedPath d={areaPath} fill="url(#growthFill)" animatedProps={animatedFillProps} />
            <AnimatedPath
              d={linePath}
              fill="none"
              stroke={BRAND.primary}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              animatedProps={animatedProps}
            />
          </>
        )}

        {points.map((point, index) => {
          const day = series[index];
          const highlighted = day.highlight;
          return (
            <Circle
              key={`${day.label}-${index}`}
              cx={point.x}
              cy={point.y}
              r={highlighted ? 6 : 4}
              fill={highlighted ? BRAND.primary : theme.cardFrosted}
              stroke={BRAND.primary}
              strokeWidth={highlighted ? 0 : 2}
            />
          );
        })}

        {series.map((day, index) => (
          <SvgText
            key={`label-${index}`}
            x={points[index].x}
            y={CHART_HEIGHT - 6}
            fill={day.highlight ? BRAND.primary : theme.textMuted}
            fontSize={10}
            fontWeight={day.highlight ? '700' : '600'}
            textAnchor="middle"
          >
            {day.label}
          </SvgText>
        ))}
      </Svg>
    </StatisticsPremiumCard>
  );
}
