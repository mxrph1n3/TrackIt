import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { HabitHeatmapRow } from '../../../types/statisticsOverview';
import { BRAND } from '../../../theme/designTokens';
import { useTheme } from '../../../theme/ThemeContext';
import { StatisticsCardBlur, StatisticsPremiumCard } from './StatisticsPremiumCard';

function heatColor(intensity: number) {
  if (intensity >= 0.85) return BRAND.primary;
  if (intensity >= 0.7) return 'rgba(119, 93, 216, 0.72)';
  if (intensity >= 0.55) return 'rgba(129, 140, 248, 0.55)';
  if (intensity >= 0.4) return 'rgba(168, 148, 232, 0.35)';
  return 'rgba(119, 93, 216, 0.12)';
}

export function HabitCompletionHeatmap({
  rangeLabel,
  weekLabels,
  rows,
}: {
  rangeLabel: string;
  weekLabels: string[];
  rows: HabitHeatmapRow[];
}) {
  const { theme } = useTheme();
  const cellSize = 22;
  const gap = 6;
  const gridWidth = weekLabels.length * cellSize + (weekLabels.length - 1) * gap;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          marginBottom: 14,
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
        gridWrap: {
          flexDirection: 'row',
        },
        yAxis: {
          marginRight: 10,
          justifyContent: 'space-between',
        },
        dayLabel: {
          fontSize: 9,
          fontWeight: '700',
          color: theme.textMuted,
          letterSpacing: 0.4,
        },
        row: {
          flexDirection: 'row',
        },
        cell: {
          borderRadius: 6,
        },
        xAxis: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        },
        weekLabel: {
          fontSize: 9,
          fontWeight: '600',
          color: theme.textMuted,
        },
        legend: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 14,
        },
        legendSwatch: {
          width: 10,
          height: 10,
          borderRadius: 3,
        },
        legendText: {
          fontSize: 10,
          color: theme.textMuted,
          marginRight: 8,
        },
      }),
    [theme],
  );

  return (
    <StatisticsPremiumCard>
      <StatisticsCardBlur />
      <View style={styles.header}>
        <Text style={styles.kicker}>Habit Completion Heatmap</Text>
        <Text style={styles.range}>{rangeLabel}</Text>
      </View>

      <View style={styles.gridWrap}>
        <View style={styles.yAxis}>
          {rows.map((row) => (
            <Text key={row.day} style={[styles.dayLabel, { height: cellSize, lineHeight: cellSize }]}>
              {row.day}
            </Text>
          ))}
        </View>

        <View>
          <View style={{ width: gridWidth }}>
            {rows.map((row) => (
              <View key={row.day} style={[styles.row, { marginBottom: gap }]}>
                {row.weeks.map((value, colIndex) => (
                  <View
                    key={`${row.day}-${colIndex}`}
                    style={[
                      styles.cell,
                      {
                        width: cellSize,
                        height: cellSize,
                        marginRight: colIndex < row.weeks.length - 1 ? gap : 0,
                        backgroundColor: heatColor(value),
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={[styles.xAxis, { width: gridWidth }]}>
            {weekLabels.map((label) => (
              <Text key={label} style={styles.weekLabel}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={[styles.legendSwatch, { backgroundColor: 'rgba(119, 93, 216, 0.12)' }]} />
        <Text style={styles.legendText}>Low</Text>
        <View style={[styles.legendSwatch, { backgroundColor: 'rgba(129, 140, 248, 0.55)' }]} />
        <Text style={styles.legendText}>Moderate</Text>
        <View style={[styles.legendSwatch, { backgroundColor: BRAND.primary }]} />
        <Text style={styles.legendText}>Complete</Text>
      </View>
    </StatisticsPremiumCard>
  );
}
