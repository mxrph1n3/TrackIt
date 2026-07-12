import { CalendarDays } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { triggerHaptic } from '../../lib/platform/haptics';
import { BRAND } from '../../theme/designTokens';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { addDays, parseDayKey, toDayKey } from '../../utils/plannerDates';

const CHIP_WIDTH = 54;
const CHIP_GAP = 8;
const CHIP_STEP = CHIP_WIDTH + CHIP_GAP;
const DAYS_BACK = 7;
const DAYS_FORWARD = 90;

type ScheduleDay = {
  key: string;
  weekday: string;
  dayNumber: number;
  monthShort: string;
  isToday: boolean;
  isTomorrow: boolean;
};

type QuickPick = {
  key: string;
  label: string;
  dayKey: string;
};

function buildScheduleDays(): ScheduleDay[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayKey = toDayKey(today);
  const tomorrowKey = toDayKey(addDays(today, 1));

  return Array.from({ length: DAYS_BACK + DAYS_FORWARD + 1 }, (_, index) => {
    const offset = index - DAYS_BACK;
    const date = addDays(today, offset);
    const key = toDayKey(date);

    return {
      key,
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: date.getDate(),
      monthShort: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: key === todayKey,
      isTomorrow: key === tomorrowKey,
    };
  });
}

function buildQuickPicks(today: Date): QuickPick[] {
  const todayKey = toDayKey(today);
  const tomorrowKey = toDayKey(addDays(today, 1));
  const nextWeekKey = toDayKey(addDays(today, 7));

  const dayOfWeek = today.getDay();
  const daysUntilSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7;
  const weekendKey = toDayKey(addDays(today, daysUntilSaturday === 0 ? 7 : daysUntilSaturday));

  return [
    { key: 'today', label: 'Today', dayKey: todayKey },
    { key: 'tomorrow', label: 'Tomorrow', dayKey: tomorrowKey },
    { key: 'weekend', label: 'Weekend', dayKey: weekendKey },
    { key: 'next-week', label: 'In 1 week', dayKey: nextWeekKey },
  ];
}

function formatScheduleSummary(dayKey: string): string {
  const date = parseDayKey(dayKey);
  const todayKey = toDayKey(new Date());
  const tomorrowKey = toDayKey(addDays(new Date(), 1));

  if (dayKey === todayKey) {
    return 'Today';
  }
  if (dayKey === tomorrowKey) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

type TaskSchedulePickerProps = {
  value: string;
  onChange: (dayKey: string) => void;
};

export function TaskSchedulePicker({ value, onChange }: TaskSchedulePickerProps) {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const scrollRef = useRef<ScrollView>(null);
  const days = useMemo(() => buildScheduleDays(), []);
  const quickPicks = useMemo(() => buildQuickPicks(new Date()), []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginBottom: 8,
        },
        label: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: theme.textMuted,
          marginBottom: 10,
        },
        summaryCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginBottom: 14,
        },
        summaryIcon: {
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${BRAND.primary}14`,
        },
        summaryCopy: {
          flex: 1,
        },
        summaryKicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: theme.textMuted,
          marginBottom: 2,
        },
        summaryValue: {
          fontSize: 15,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        quickRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 14,
        },
        quickChip: {
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: isDark ? theme.card : '#FFFFFF',
        },
        quickChipActive: {
          borderColor: BRAND.primary,
          backgroundColor: `${BRAND.primary}14`,
        },
        quickChipLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.textSecondary,
        },
        quickChipLabelActive: {
          color: BRAND.primary,
        },
        ribbonLabel: {
          fontSize: 11,
          fontWeight: '600',
          color: theme.textMuted,
          marginBottom: 8,
        },
        ribbonContent: {
          gap: CHIP_GAP,
          paddingVertical: 2,
          paddingRight: 4,
        },
        dayChip: {
          width: CHIP_WIDTH,
          height: 72,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: isDark ? theme.card : '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        },
        dayChipActive: {
          borderColor: BRAND.primary,
          backgroundColor: BRAND.primary,
        },
        dayChipToday: {
          borderColor: `${BRAND.primary}55`,
        },
        dayWeekday: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          color: theme.textMuted,
          marginBottom: 2,
        },
        dayNumber: {
          fontSize: 18,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        dayMonth: {
          marginTop: 2,
          fontSize: 10,
          fontWeight: '600',
          color: theme.textMuted,
        },
        dayTextActive: {
          color: '#FFFFFF',
        },
        hint: {
          marginTop: 10,
          fontSize: 12,
          fontWeight: '500',
          lineHeight: 17,
          color: theme.textMuted,
        },
      }),
    [isDark, surfaces.inset, theme],
  );

  const scrollToDay = useCallback(
    (dayKey: string, animated = true) => {
      const index = days.findIndex((day) => day.key === dayKey);
      if (index < 0 || !scrollRef.current) {
        return;
      }

      const x = Math.max(0, index * CHIP_STEP - CHIP_STEP * 2);
      scrollRef.current.scrollTo({ x, animated });
    },
    [days],
  );

  useEffect(() => {
    scrollToDay(value, false);
  }, [scrollToDay, value]);

  const handleSelect = useCallback(
    (dayKey: string) => {
      void triggerHaptic('selection');
      onChange(dayKey);
      scrollToDay(dayKey);
    },
    [onChange, scrollToDay],
  );

  const summary = formatScheduleSummary(value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Schedule for</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <CalendarDays color={BRAND.primary} size={18} strokeWidth={2.2} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryKicker}>Due date</Text>
          <Text style={styles.summaryValue}>{summary}</Text>
        </View>
      </View>

      <View style={styles.quickRow}>
        {quickPicks.map((pick) => {
          const isActive = value === pick.dayKey;
          return (
            <Pressable
              key={pick.key}
              onPress={() => handleSelect(pick.dayKey)}
              style={[styles.quickChip, isActive && styles.quickChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.quickChipLabel, isActive && styles.quickChipLabelActive]}>
                {pick.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.ribbonLabel}>Or pick a day</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CHIP_STEP}
        snapToAlignment="start"
        contentContainerStyle={styles.ribbonContent}
        keyboardShouldPersistTaps="handled"
      >
        {days.map((day) => {
          const isSelected = day.key === value;
          const isTodayUnselected = day.isToday && !isSelected;

          return (
            <Pressable
              key={day.key}
              onPress={() => handleSelect(day.key)}
              style={[
                styles.dayChip,
                isTodayUnselected && styles.dayChipToday,
                isSelected && styles.dayChipActive,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${day.weekday} ${day.monthShort} ${day.dayNumber}`}
            >
              <Text style={[styles.dayWeekday, isSelected && styles.dayTextActive]}>
                {day.isToday ? 'TODAY' : day.isTomorrow ? 'TOM' : day.weekday}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.dayTextActive]}>
                {day.dayNumber}
              </Text>
              <Text style={[styles.dayMonth, isSelected && styles.dayTextActive]}>
                {day.monthShort}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.hint}>Swipe the row to plan weeks ahead — each chip is one day.</Text>
    </View>
  );
}

export function formatTaskScheduleLabel(dayKey: string): string {
  const summary = formatScheduleSummary(dayKey);
  if (summary === 'Today' || summary === 'Tomorrow') {
    return summary.toLowerCase();
  }
  const date = parseDayKey(dayKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
