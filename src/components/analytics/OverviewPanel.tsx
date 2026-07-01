import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { useGamification } from '../../hooks/useGamification';
import { DASHBOARD_CATEGORY_COLORS } from '../../lib/dashboard/metrics';
import { getTopPercentileLabel } from '../../lib/gamification/progression';
import { useTheme } from '../../theme/ThemeContext';
import type { LifeAttribute } from '../../types/analytics';
import { GlassPanel } from '../GlassPanel';

const SIZE = 260;
const CENTER = SIZE / 2;
const MAX_RADIUS = 92;
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

function polarPoint(index: number, total: number, radius: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / total;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function buildPolygonPoints(attributes: LifeAttribute[]) {
  return attributes
    .map((attr, index) => {
      const radius = (attr.value / 100) * MAX_RADIUS;
      const point = polarPoint(index, attributes.length, radius);
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

type LifeRadarChartProps = {
  attributes?: LifeAttribute[];
};

export function LifeRadarChart({ attributes: attributesOverride }: LifeRadarChartProps) {
  const { theme } = useTheme();
  const { progress } = useDashboardMetrics();

  const attributes: LifeAttribute[] =
    attributesOverride ??
    progress.categories.map((category) => ({
      id: category.id,
      label: category.label,
      value: category.percent,
      color: DASHBOARD_CATEGORY_COLORS[category.id as keyof typeof DASHBOARD_CATEGORY_COLORS],
    }));

  const polygonPoints = buildPolygonPoints(attributes);

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="items-center p-5">
        <Text
          className="mb-4 self-start text-[10px] font-bold uppercase tracking-widest"
          style={{ color: theme.textMuted }}
        >
          RPG Skill Hexagon
        </Text>

        <Svg width={SIZE} height={SIZE}>
          {GRID_LEVELS.map((level) => (
            <Circle
              key={level}
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * level}
              fill="transparent"
              stroke={theme.gridStroke}
              strokeWidth={1}
            />
          ))}

          {attributes.map((_, index) => {
            const outer = polarPoint(index, attributes.length, MAX_RADIUS);
            return (
              <Line
                key={`axis-${index}`}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke={theme.axisStroke}
                strokeWidth={1}
              />
            );
          })}

          <Polygon
            points={polygonPoints}
            fill={theme.radarFill}
            stroke={theme.radarStroke}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {attributes.map((attr, index) => {
            const labelPoint = polarPoint(index, attributes.length, MAX_RADIUS + 22);
            return (
              <SvgText
                key={attr.id}
                x={labelPoint.x}
                y={labelPoint.y}
                fill={theme.textSecondary}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {attr.label}
              </SvgText>
            );
          })}
        </Svg>

        <View className="mt-2 w-full flex-row flex-wrap justify-center gap-x-4 gap-y-2">
          {attributes.map((attr) => (
            <Text key={attr.id} className="text-xs font-semibold" style={{ color: theme.textMuted }}>
              {attr.label}:{' '}
              <Text style={{ color: theme.textPrimary, fontWeight: '800' }}>{attr.value}%</Text>
            </Text>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}

export function PerformanceRankCard() {
  const { theme } = useTheme();
  const { fetchGlobalLeaderboard, globalRank, isLoading } = useGamification();

  useEffect(() => {
    void fetchGlobalLeaderboard();
  }, [fetchGlobalLeaderboard]);

  const tier = globalRank?.performanceTier ?? '—';
  const percentileLabel = globalRank
    ? getTopPercentileLabel(globalRank.percentile)
    : isLoading
      ? 'Loading…'
      : '—';
  const tierLabel = globalRank?.tierLabel ?? 'Sync your profile to unlock rank';

  return (
    <GlassPanel borderRadius={24}>
      <View className="flex-row items-center justify-between p-5">
        <View>
          <Text
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: theme.textMuted }}
          >
            Performance Ranking
          </Text>
          <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
            Global #{globalRank?.rankPosition ?? '—'}
          </Text>
          <Text
            className="mt-1 text-3xl font-black"
            style={{
              color: theme.textPrimary,
              textShadowColor: theme.glowPurple,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 14,
            }}
          >
            {tier}
          </Text>
        </View>

        <View className="items-end">
          <View
            className="rounded-full border px-4 py-2"
            style={{ borderColor: `${theme.primary}66`, backgroundColor: `${theme.primary}22` }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: theme.primary }}
            >
              {percentileLabel}
            </Text>
          </View>
          <Text className="mt-3 text-xs" style={{ color: theme.textMuted }}>
            {tierLabel}
          </Text>
        </View>
      </View>
    </GlassPanel>
  );
}
