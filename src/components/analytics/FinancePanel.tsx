import { ActivityIndicator, Text, View } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { useFinanceLiveData } from '../../hooks/useFinanceLiveData';
import type { ExpenseSlice } from '../../types/analytics';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

const SIZE = 220;
const STROKE = 22;
const RADIUS = SIZE / 2 - STROKE;

function mapExpenseSlices(
  categories: Array<{ id: string; name: string; percentage: number; color: string }>,
): ExpenseSlice[] {
  if (categories.length === 0) return [];

  const top = categories.slice(0, 4);
  const topTotal = top.reduce((sum, item) => sum + item.percentage, 0);
  const slices: ExpenseSlice[] = top.map((item) => ({
    id: item.id,
    label: item.name,
    percentage: item.percentage,
    color: item.color,
  }));

  if (categories.length > 4 && topTotal < 100) {
    slices.push({
      id: 'other',
      label: 'Other',
      percentage: Math.max(0, 100 - topTotal),
      color: '#60A5FA',
    });
  }

  return slices;
}

export function FinanceDonutChart() {
  const { data, isLoading } = useFinanceLiveData();
  const { theme } = useTheme();
  const slices = mapExpenseSlices(data.expenseCategories);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const circumference = 2 * Math.PI * RADIUS;
  let cursor = 0;

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
      <View className="items-center p-5">
        <Text className="mb-4 self-start text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          Monthly Expenditures
        </Text>

        {isLoading && data.expenseCategories.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color={theme.textPrimary} size="small" />
          </View>
        ) : slices.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-sm text-ethereal-slate">No expenses logged this month yet.</Text>
          </View>
        ) : (
          <>
            <Svg width={SIZE} height={SIZE}>
              <G>
                {slices.map((slice) => {
                  const start = cursor;
                  cursor += slice.percentage;
                  const dash = (slice.percentage / 100) * circumference;

                  return (
                    <Circle
                      key={slice.id}
                      cx={cx}
                      cy={cy}
                      r={RADIUS}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={STROKE}
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeDashoffset={-((start / 100) * circumference)}
                      rotation={-90}
                      origin={`${cx}, ${cy}`}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </G>

              <Circle
                cx={cx}
                cy={cy}
                r={RADIUS - STROKE + 4}
                fill="#07070A"
                stroke="rgba(168, 85, 247, 0.25)"
                strokeWidth={1}
              />

              <SvgText
                x={cx}
                y={cy - 6}
                fill={theme.textPrimary}
                fontSize={22}
                fontWeight="700"
                textAnchor="middle"
              >
                100%
              </SvgText>
              <SvgText
                x={cx}
                y={cy + 14}
                fill={theme.textMuted}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
              >
                Allocated
              </SvgText>
            </Svg>

            <View className="mt-4 w-full gap-2.5">
              {slices.map((slice) => (
                <View key={slice.id} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: slice.color,
                        shadowColor: slice.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 6,
                      }}
                    />
                    <Text className="text-sm font-medium text-ethereal-ink/90">{slice.label}</Text>
                  </View>
                  <Text className="text-sm font-bold text-ethereal-ink">{slice.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </GlassPanel>
  );
}

export function FinanceInsightCard() {
  const { data } = useFinanceLiveData();
  const insight =
    data.financeTips[0] ??
    (data.expenseCategories.length === 0
      ? 'Log your first expense to unlock spending insights for this month.'
      : 'Your spending mix looks balanced this month. Keep tracking to refine insights.');

  return (
    <GlassPanel borderRadius={24}>
      <View className="p-5">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-obsidian-primary">
          Smart tip
        </Text>
        <Text className="mt-1 text-[10px] text-ethereal-slate/70">Rule-based from your data</Text>
        <Text className="mt-3 text-sm leading-6 text-ethereal-slate">{insight}</Text>
      </View>
    </GlassPanel>
  );
}
