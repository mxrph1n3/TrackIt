import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { tWeekdayShort, tWorkoutProgramDay } from '../../i18n/helpers';
import { useHealthStore } from '../../stores/useHealthStore';

function parseProgramDayKey(dayKey: string): { week: number; day: number } | null {
  const match = /^w(\d+)-d(\d+)$/.exec(dayKey);
  if (!match) return null;
  return { week: Number(match[1]), day: Number(match[2]) };
}

export function WeeklyTrackerGrid() {
  const { t } = useTranslation();
  const weeklyPlan = useHealthStore((s) => s.weeklyPlan);
  const selectedDayIndex = useHealthStore((s) => s.selectedDayIndex);
  const selectDay = useHealthStore((s) => s.selectDay);
  const trackId = useHealthStore((s) => s.selectedTrackId);

  return (
    <View className="mb-4">
      <Text className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
        {t('health.weekPlan')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4, paddingVertical: 4 }}
      >
        {weeklyPlan.map((day, index) => {
          const parsed = parseProgramDayKey(day.dayKey);
          const split =
            parsed != null
              ? tWorkoutProgramDay(t, trackId, parsed.week, parsed.day, day.split)
              : day.split;

          return (
            <Pressable key={day.dayKey} onPress={() => selectDay(index)} className="active:opacity-90">
              <View
                className={`min-w-[120px] rounded-2xl border px-3 py-2.5 ${
                  day.isToday
                    ? 'border-obsidian-primary/50 bg-obsidian-primary/15'
                    : 'border-obsidian-border bg-white/[0.04]'
                }`}
              >
                <Text
                  numberOfLines={1}
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    index === selectedDayIndex ? 'text-obsidian-primary' : 'text-ethereal-slate'
                  }`}
                >
                  {tWeekdayShort(t, day.dayLabel)}
                </Text>
                <Text
                  numberOfLines={2}
                  className="mt-1 text-[11px] font-semibold leading-4 text-ethereal-ink"
                >
                  {split}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
