import { Flame } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { HabitWithWeek } from '../../lib/habits/service';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';
import { HabitDayCheckbox } from './HabitDayCheckbox';

type HabitCardProps = {
  item: HabitWithWeek;
  disabled?: boolean;
  onToggleDay: (habitId: string, dayKey: string, nextCompleted: boolean) => void;
};

export function HabitCard({ item, disabled, onToggleDay }: HabitCardProps) {
  const { theme } = useTheme();

  return (
    <GlassPanel borderRadius={24} style={{ marginBottom: 14 }}>
      <View className="p-4">
        <View className="mb-4 flex-row items-start justify-between">
          <Text className="flex-1 pr-3 text-lg font-bold" style={{ color: theme.textPrimary }}>
            {item.habit.title}
          </Text>

          {item.streakDays > 0 ? (
            <View
              className="flex-row items-center gap-1 rounded-full px-3 py-1"
              style={{ backgroundColor: `${theme.primary}22` }}
            >
              <Flame color={theme.primary} size={12} strokeWidth={2.4} />
              <Text className="text-xs font-black" style={{ color: theme.primary }}>
                {item.streakDays} Days
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row justify-between">
          {item.week.map((day) => (
            <View key={day.key} className="items-center">
              <Text
                className="mb-2 text-[9px] font-bold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                {day.label}
              </Text>
              <HabitDayCheckbox
                completed={day.completed}
                isToday={day.isToday}
                disabled={disabled}
                onToggle={() =>
                  onToggleDay(item.habit.id, day.key, !day.completed)
                }
              />
              <Text className="mt-1.5 text-[10px] font-semibold" style={{ color: theme.textSecondary }}>
                {day.date}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </GlassPanel>
  );
}
