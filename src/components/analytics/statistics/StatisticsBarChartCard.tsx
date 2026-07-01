import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import type { BarChartPoint } from '../../../types/statisticsOverview';
import { BRAND, SEMANTIC } from '../../../theme/designTokens';
import { useTheme } from '../../../theme/ThemeContext';
import { timingProgress } from '../../../theme/motion';
import { StatisticsCardBlur, StatisticsPremiumCard } from './StatisticsPremiumCard';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_HEIGHT = 88;
const CHART_WIDTH = 148;

type StatisticsBarChartCardProps = {
  title: string;
  subtitle: string;
  data: BarChartPoint[];
  accent?: string;
  valueFormatter?: (value: number) => string;
  flex?: number;
};

function AnimatedBar({
  x,
  width,
  targetHeight,
  color,
  delayMs,
}: {
  x: number;
  width: number;
  targetHeight: number;
  color: string;
  delayMs: number;
}) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(
      delayMs,
      withTiming(targetHeight, timingProgress()),
    );
  }, [delayMs, height, targetHeight]);

  const animatedProps = useAnimatedProps(() => ({
    height: height.value,
    y: CHART_HEIGHT - 18 - height.value,
  }));

  return (
    <AnimatedRect
      x={x}
      y={CHART_HEIGHT - 18}
      height={0}
      width={width}
      rx={5}
      fill={color}
      opacity={0.9}
      animatedProps={animatedProps}
    />
  );
}

export function StatisticsBarChartCard({
  title,
  subtitle,
  data,
  accent = BRAND.primary,
  valueFormatter,
  flex,
}: StatisticsBarChartCardProps) {
  const { theme } = useTheme();
  const max = Math.max(...data.map((item) => item.value), 1);
  const barGap = 8;
  const barWidth = data.length > 0 ? (CHART_WIDTH - barGap * (data.length + 1)) / data.length : 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        halfCard: {
          marginBottom: 0,
        },
        kicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: theme.textPrimary,
        },
        subtitle: {
          marginTop: 3,
          marginBottom: 10,
          fontSize: 10,
          fontWeight: '500',
          color: theme.textMuted,
        },
        chart: {
          alignSelf: 'center',
        },
        peak: {
          marginTop: 6,
          fontSize: 10,
          fontWeight: '600',
          color: theme.textSecondary,
          textAlign: 'center',
        },
      }),
    [theme],
  );

  return (
    <StatisticsPremiumCard flex={flex} style={flex != null ? styles.halfCard : undefined}>
      <StatisticsCardBlur />
      <Text style={styles.kicker}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.chart}>
        {data.map((point, index) => {
          const barHeight = (point.value / max) * (CHART_HEIGHT - 28);
          const x = barGap + index * (barWidth + barGap);
          return (
            <AnimatedBar
              key={point.label}
              x={x}
              width={barWidth}
              targetHeight={barHeight}
              color={accent}
              delayMs={index * 60}
            />
          );
        })}

        {data.map((point, index) => {
          const x = barGap + index * (barWidth + barGap) + barWidth / 2;
          return (
            <SvgText
              key={`label-${point.label}`}
              x={x}
              y={CHART_HEIGHT - 4}
              fill={theme.textMuted}
              fontSize={9}
              fontWeight="600"
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          );
        })}
      </Svg>

      {valueFormatter && data.length > 0 ? (
        <Text style={styles.peak}>
          Peak: {valueFormatter(Math.max(...data.map((item) => item.value)))}
        </Text>
      ) : null}
    </StatisticsPremiumCard>
  );
}

export const STATISTICS_BAR_ACCENTS = {
  workout: BRAND.primary,
  nutrition: SEMANTIC.warning,
  expense: SEMANTIC.expenseSoft,
  income: SEMANTIC.incomeSoft,
} as const;
