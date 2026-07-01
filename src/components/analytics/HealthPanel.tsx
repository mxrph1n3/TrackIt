import { ActivityIndicator, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { useAnalyticsHealth } from '../../hooks/useAnalyticsHealth';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

const WIDTH = 320;
const HEIGHT = 220;
const PAD = { top: 20, right: 44, bottom: 32, left: 44 };

function normalize(values: number[], minPad = 0.08) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value) => minPad + ((value - min) / range) * (1 - minPad * 2));
}

export function HealthDualLineChart() {
  const { data, isLoading } = useAnalyticsHealth();
  const { theme } = useTheme();
  const series = data.series;
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;

  const calories = series.map((p) => p.calories);
  const weights = series.map((p) => p.weight);
  const normCalories = normalize(calories.length ? calories : [0]);
  const normWeights = data.hasWeightData ? normalize(weights) : [];

  const caloriePoints = series.map((point, index) => {
    const x = PAD.left + (index / Math.max(series.length - 1, 1)) * innerWidth;
    const y = PAD.top + innerHeight - normCalories[index] * innerHeight;
    return { ...point, x, y };
  });

  const weightPoints = series.map((point, index) => {
    const x = PAD.left + (index / Math.max(series.length - 1, 1)) * innerWidth;
    const y = PAD.top + innerHeight - normWeights[index] * innerHeight;
    return { x, y, weight: point.weight };
  });

  return (
    <GlassPanel borderRadius={24}>
      <View className="p-5">
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          Nutrition Trends
        </Text>
        <Text className="mb-4 text-xs text-ethereal-slate">
          {data.hasWeightData
            ? 'Daily calorie intake vs body weight (7-day view)'
            : 'Daily calorie intake (7-day view)'}
        </Text>

        {isLoading && !data.isLive ? (
          <View className="items-center py-12">
            <ActivityIndicator color={theme.textPrimary} size="small" />
          </View>
        ) : (
          <>
            <Svg width={WIDTH} height={HEIGHT}>
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const y = PAD.top + innerHeight - tick * innerHeight;
                return (
                  <Line
                    key={tick}
                    x1={PAD.left}
                    y1={y}
                    x2={WIDTH - PAD.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={1}
                  />
                );
              })}

              <SvgText
                x={8}
                y={PAD.top + 8}
                fill={theme.textMuted}
                fontSize={9}
                fontWeight="600"
              >
                kcal
              </SvgText>
              {data.hasWeightData ? (
                <SvgText
                  x={WIDTH - 36}
                  y={PAD.top + 8}
                  fill={theme.textMuted}
                  fontSize={9}
                  fontWeight="600"
                >
                  kg
                </SvgText>
              ) : null}

              <Polyline
                points={caloriePoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#775DD8"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {data.hasWeightData ? (
                <Polyline
                  points={weightPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
              ) : null}

              {caloriePoints.map((point) => (
                <Circle key={`cal-${point.day}`} cx={point.x} cy={point.y} r={3.5} fill="#775DD8" />
              ))}

              {data.hasWeightData
                ? weightPoints.map((point, index) => (
                    <Circle
                      key={`wt-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r={3.5}
                      fill="#94A3B8"
                      stroke="#07070A"
                      strokeWidth={1}
                    />
                  ))
                : null}

              {caloriePoints.map((point) => (
                <SvgText
                  key={`day-${point.day}`}
                  x={point.x}
                  y={HEIGHT - 10}
                  fill={theme.textSecondary}
                  fontSize={9}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {point.day}
                </SvgText>
              ))}
            </Svg>

            <View className="mt-3 flex-row items-center justify-center gap-6">
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-5 rounded-full bg-obsidian-primary" />
                <Text className="text-xs font-semibold text-slate-300">Calorie Intake</Text>
              </View>
              {data.hasWeightData ? (
                <View className="flex-row items-center gap-2">
                  <View className="h-2 w-5 rounded-full" style={{ backgroundColor: '#94A3B8' }} />
                  <Text className="text-xs font-semibold text-slate-300">Body Weight</Text>
                </View>
              ) : null}
            </View>

            <View className="mt-4 flex-row justify-between border-t border-white/5 pt-4">
              <View>
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Avg Calories
                </Text>
                <Text className="mt-1 text-base font-bold text-ethereal-ink">
                  {data.avgCalories > 0 ? `${data.avgCalories.toLocaleString()} kcal` : '—'}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Weight Tracking
                </Text>
                <Text className="mt-1 text-base font-bold text-slate-300">
                  {data.hasWeightData && data.weightDelta != null
                    ? `${data.weightDelta > 0 ? '+' : ''}${data.weightDelta} kg`
                    : 'Not logged yet'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </GlassPanel>
  );
}
