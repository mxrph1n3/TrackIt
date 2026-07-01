import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { BRAND } from '../../theme/designTokens';
import type { PlannerMonthDay } from '../../types/planner';
import { PlannerPremiumCard } from './PlannerPremiumCard';

type PlannerMonthCalendarProps = {
  monthLabel: string;
  weekdayLabels: readonly string[];
  days: PlannerMonthDay[];
  onSelectDay: (dayKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export function PlannerMonthCalendar({
  monthLabel,
  weekdayLabels,
  days,
  onSelectDay,
  onPreviousMonth,
  onNextMonth,
}: PlannerMonthCalendarProps) {
  const { theme, isDark } = usePlannerTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        inner: {
          paddingHorizontal: 18,
          paddingTop: 16,
          paddingBottom: 18,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        },
        navButton: {
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
        },
        monthLabel: {
          flex: 1,
          textAlign: 'center',
          fontSize: 13,
          fontWeight: '800',
          letterSpacing: 1.4,
          color: theme.textSecondary,
          textTransform: 'uppercase',
        },
        weekdayRow: {
          flexDirection: 'row',
          marginBottom: 8,
        },
        weekday: {
          flex: 1,
          textAlign: 'center',
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.8,
          color: theme.textMuted,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
        },
        cell: {
          width: `${100 / 7}%`,
          alignItems: 'center',
          paddingVertical: 4,
        },
        dayBubble: {
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: 'center',
          justifyContent: 'center',
        },
        dayBubbleActive: {
          backgroundColor: isDark ? 'rgba(119, 93, 216, 0.35)' : BRAND.primaryLight,
        },
        dayBubbleMuted: {
          opacity: 0.55,
        },
        dayText: {
          fontSize: 15,
          fontWeight: '600',
          color: theme.textPrimary,
        },
        dayTextMuted: {
          color: theme.textMuted,
        },
        dayTextActive: {
          color: theme.textPrimary,
          fontWeight: '800',
        },
      }),
    [isDark, theme],
  );

  return (
    <PlannerPremiumCard>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              onPreviousMonth();
            }}
            hitSlop={10}
            style={styles.navButton}
            accessibilityLabel="Previous month"
          >
            <ChevronLeft color={theme.textSecondary} size={20} strokeWidth={2} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              onNextMonth();
            }}
            hitSlop={10}
            style={styles.navButton}
            accessibilityLabel="Next month"
          >
            <ChevronRight color={theme.textSecondary} size={20} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label) => (
            <Text key={label} style={styles.weekday}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {days.map((day) => {
            const isHighlighted = day.isSelected || day.isToday;

            return (
              <Pressable
                key={day.key}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onSelectDay(day.key);
                }}
                style={styles.cell}
                accessibilityRole="button"
                accessibilityState={{ selected: day.isSelected }}
              >
                <View
                  style={[
                    styles.dayBubble,
                    isHighlighted && styles.dayBubbleActive,
                    !day.inCurrentMonth && styles.dayBubbleMuted,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !day.inCurrentMonth && styles.dayTextMuted,
                      isHighlighted && styles.dayTextActive,
                    ]}
                  >
                    {day.date}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </PlannerPremiumCard>
  );
}
