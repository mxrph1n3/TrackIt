import { Pressable, ScrollView, Text, View } from 'react-native';

import { useHealthStore } from '../../stores/useHealthStore';

export function WeeklyTrackerGrid() {
  const weeklyPlan = useHealthStore((s) => s.weeklyPlan);
  const selectedDayIndex = useHealthStore((s) => s.selectedDayIndex);
  const selectDay = useHealthStore((s) => s.selectDay);

  return (
    <View className="mb-4">
      <Text className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
        Week plan
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 4, paddingVertical: 4 }}
      >
        {weeklyPlan.map((day, index) => (
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
                {day.dayLabel}
              </Text>
              <Text
                numberOfLines={2}
                className="mt-1 text-[11px] font-semibold leading-4 text-ethereal-ink"
              >
                {day.split}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
