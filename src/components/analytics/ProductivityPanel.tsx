import { ActivityIndicator, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { useAnalyticsProductivity } from '../../hooks/useAnalyticsProductivity';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

function heatmapColor(intensity: number) {
  if (intensity >= 0.85) return '#775DD8';
  if (intensity >= 0.65) return 'rgba(168, 85, 247, 0.65)';
  if (intensity >= 0.45) return 'rgba(99, 102, 241, 0.45)';
  if (intensity >= 0.25) return 'rgba(255, 255, 255, 0.12)';
  return 'rgba(255, 255, 255, 0.04)';
}

export function FocusHeatmap() {
  const { data, isLoading } = useAnalyticsProductivity();
  const { theme } = useTheme();
  const cellSize = 18;
  const gap = 4;
  const gridWidth = 12 * cellSize + 11 * gap;
  const gridHeight = 7 * cellSize + 6 * gap;

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="p-5">
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          Focus Heatmap
        </Text>
        <Text className="mb-4 text-xs text-ethereal-slate">
          7 days · 12 focus blocks per day
        </Text>

        {isLoading && !data.isLive ? (
          <View className="items-center py-10">
            <ActivityIndicator color={theme.textPrimary} size="small" />
          </View>
        ) : (
          <View className="flex-row">
            <View className="mr-2 justify-between" style={{ height: gridHeight }}>
              {data.heatmapDayLabels.map((day) => (
                <Text
                  key={day}
                  className="text-[9px] font-semibold text-ethereal-slate"
                  style={{ height: cellSize, lineHeight: cellSize }}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View>
              <View style={{ width: gridWidth, height: gridHeight }}>
                {data.focusHeatmap.map((row, rowIndex) => (
                  <View
                    key={`row-${rowIndex}`}
                    className="flex-row"
                    style={{
                      marginBottom: rowIndex < data.focusHeatmap.length - 1 ? gap : 0,
                    }}
                  >
                    {row.map((value, colIndex) => (
                      <View
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          marginRight: colIndex < row.length - 1 ? gap : 0,
                          borderRadius: 4,
                          backgroundColor: heatmapColor(value),
                          borderWidth: value >= 0.85 ? 1 : 0,
                          borderColor: 'rgba(196, 132, 252, 0.8)',
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>

              <View className="mt-3 flex-row justify-between" style={{ width: gridWidth }}>
                {['6a', '9a', '12p', '3p', '6p', '9p'].map((label) => (
                  <Text key={label} className="text-[8px] font-semibold text-ethereal-slate">
                    {label}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-2.5 w-2.5 rounded-sm bg-white/5" />
          <Text className="text-[10px] text-ethereal-slate">Low</Text>
          <View className="h-2.5 w-2.5 rounded-sm bg-indigo-500/40" />
          <Text className="text-[10px] text-ethereal-slate">Moderate</Text>
          <View className="h-2.5 w-2.5 rounded-sm bg-obsidian-primary" />
          <Text className="text-[10px] text-ethereal-slate">Peak Focus</Text>
        </View>
      </View>
    </GlassPanel>
  );
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const CHART_PADDING = { top: 16, right: 12, bottom: 28, left: 36 };

export function TaskCompletionChart() {
  const { data, isLoading } = useAnalyticsProductivity();
  const { theme } = useTheme();
  const series = data.taskCompletion;
  const innerWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const maxPercent = 100;

  const points = series.map((point, index) => {
    const x =
      CHART_PADDING.left +
      (index / Math.max(series.length - 1, 1)) * innerWidth;
    const y =
      CHART_PADDING.top + innerHeight - (point.percent / maxPercent) * innerHeight;
    return { ...point, x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <GlassPanel borderRadius={24}>
      <View className="p-5">
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          Planner Task Completion
        </Text>
        <Text className="mb-4 text-xs text-ethereal-slate">Weekly completion rate (%)</Text>

        {isLoading && !data.isLive ? (
          <View className="items-center py-10">
            <ActivityIndicator color={theme.textPrimary} size="small" />
          </View>
        ) : (
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = CHART_PADDING.top + innerHeight - (tick / maxPercent) * innerHeight;
              return (
                <Line
                  key={tick}
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={CHART_WIDTH - CHART_PADDING.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
              );
            })}

            <Polyline
              points={polylinePoints}
              fill="none"
              stroke="#775DD8"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {points.map((point) => (
              <Circle
                key={point.day}
                cx={point.x}
                cy={point.y}
                r={4}
                fill="#775DD8"
                stroke={theme.textPrimary}
                strokeWidth={1.5}
              />
            ))}

            {points.map((point) => (
              <SvgText
                key={`label-${point.day}`}
                x={point.x}
                y={CHART_HEIGHT - 8}
                fill={theme.textSecondary}
                fontSize={9}
                fontWeight="600"
                textAnchor="middle"
              >
                {point.day}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>
    </GlassPanel>
  );
}
