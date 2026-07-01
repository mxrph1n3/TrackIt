import { useEffect, useMemo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import type { WeeklyDayScore } from '../../lib/welcome/weeklyProgressService';
import { MOTION_DURATION, timingEntrance } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHART_HEIGHT = 64;
const PADDING_X = 8;
const PADDING_Y = 8;
const STROKE_WIDTH = 1.5;
const DOT_RADIUS = 3;
const DAY_BADGE = 24;

const DEFAULT_ACCENT = '#775DD8';

type WeeklyProgressChartProps = {
  days: WeeklyDayScore[];
  animate?: boolean;
  accentColor?: string;
};

function sanitizeScores(days: WeeklyDayScore[]): number[] {
  return days.map((day) => Math.min(100, Math.max(0, day.score ?? 0)));
}

function getBaselineY(): number {
  // 0% score maps to the bottom inner edge of the plot area.
  return CHART_HEIGHT - PADDING_Y;
}

function scoreToY(score: number): number {
  const innerHeight = CHART_HEIGHT - PADDING_Y * 2;
  if (score <= 0) {
    return getBaselineY();
  }
  return PADDING_Y + innerHeight - (score / 100) * innerHeight;
}

function toChartPoints(scores: number[], chartWidth: number) {
  const innerWidth = chartWidth - PADDING_X * 2;
  const step = scores.length > 1 ? innerWidth / (scores.length - 1) : 0;

  return scores.map((score, index) => ({
    x: PADDING_X + step * index,
    y: scoreToY(score),
    score,
  }));
}

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function buildLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const flatLine = points.every((point) => point.y === points[0].y);
  if (flatLine) {
    return points.reduce(
      (path, point, index) =>
        index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`,
      '',
    );
  }

  return buildSmoothPath(points);
}

function estimatePathLength(points: Array<{ x: number; y: number }>): number {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index].x - points[index - 1].x;
    const dy = points[index].y - points[index - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }

  const flatLine = points.length > 1 && points.every((point) => point.y === points[0].y);
  return flatLine ? length : length * 1.35;
}

export function WeeklyProgressChart({
  days,
  animate = true,
  accentColor = DEFAULT_ACCENT,
}: WeeklyProgressChartProps) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 112, 300);

  const sanitizedScores = useMemo(() => sanitizeScores(days), [days]);
  const points = useMemo(
    () => toChartPoints(sanitizedScores, chartWidth),
    [chartWidth, sanitizedScores],
  );
  const pathD = useMemo(() => buildLinePath(points), [points]);
  const pathLength = useMemo(() => estimatePathLength(points), [points]);

  const drawProgress = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) {
      drawProgress.value = 1;
      return;
    }

    drawProgress.value = 0;
    drawProgress.value = withDelay(
      500,
      withTiming(1, timingEntrance(MOTION_DURATION.chart)),
    );
  }, [animate, drawProgress, pathD]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - drawProgress.value),
  }));

  return (
    <View style={{ width: chartWidth, alignSelf: 'center' }}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <AnimatedPath
          d={pathD}
          stroke={accentColor}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${pathLength} ${pathLength}`}
          animatedProps={animatedLineProps}
        />
        {points.map((point, index) => (
          <Circle
            key={`dot-${index}`}
            cx={point.x}
            cy={point.y}
            r={DOT_RADIUS}
            fill="#FFFFFF"
            stroke={accentColor}
            strokeWidth={1.5}
          />
        ))}
      </Svg>

      <View style={{ width: chartWidth, height: DAY_BADGE + 4, marginTop: 8 }}>
        {days.map((day, index) => {
          const point = points[index];
          if (!point) return null;

          return (
            <View
              key={day.dayKey || `day-${index}`}
              style={{
                position: 'absolute',
                left: point.x - DAY_BADGE / 2,
                width: DAY_BADGE,
                height: DAY_BADGE,
                borderRadius: DAY_BADGE / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: day.isToday ? accentColor : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: day.isToday ? '#FFFFFF' : theme.textSecondary,
                  opacity: day.isToday ? 1 : 0.65,
                }}
              >
                {day.shortLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
