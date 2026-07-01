import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScheduleItem } from '../../types/dashboard';
import { navigateTab } from '../../navigation/navigationRef';
import { usePlannerNavigationStore } from '../../stores/usePlannerNavigationStore';
import { usePlannerStore } from '../../stores/usePlannerStore';
import { useTheme } from '../../theme/ThemeContext';
import { toDayKey } from '../../utils/plannerDates';
import { AddTaskPillButton } from '../ui/AddTaskPillButton';
import { GlassPanel } from '../GlassPanel';
import { ScheduleCheckbox } from './ScheduleCheckbox';

type TodaysScheduleCardProps = {
  schedule: ScheduleItem[];
  isEmpty: boolean;
  onToggleItem: (id: string) => void;
};

export function TodaysScheduleCard({ schedule, isEmpty, onToggleItem }: TodaysScheduleCardProps) {
  const openTaskSheet = usePlannerStore((s) => s.openTaskSheet);
  const openAllTasks = usePlannerNavigationStore((s) => s.openAllTasks);
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        addTaskCenter: {
          marginTop: 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        viewAllButton: {
          paddingHorizontal: 4,
          paddingVertical: 6,
        },
        viewAllLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.primaryNeon,
        },
        pressed: {
          opacity: 0.86,
        },
      }),
    [theme.primaryNeon],
  );

  const handleAddTask = () => {
    openTaskSheet(toDayKey(new Date()));
  };

  const handleViewAll = () => {
    openAllTasks();
    navigateTab('Planner');
  };

  return (
    <GlassPanel borderRadius={26} style={{ marginBottom: 14 }}>
      <View className="p-5">
        <View className="mb-4 flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-[11px] font-bold uppercase tracking-[0.22em] text-ethereal-ink">
            Today&apos;s Schedule
          </Text>

          {!isEmpty ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all schedule items"
              onPress={handleViewAll}
              style={({ pressed }) => [styles.viewAllButton, pressed && styles.pressed]}
              className="active:opacity-70"
            >
              <Text style={styles.viewAllLabel}>View All</Text>
            </Pressable>
          ) : null}
        </View>

        {isEmpty ? (
          <View
            className="rounded-2xl border border-dashed px-4 py-6"
            style={{
              borderColor: theme.borderSubtle,
              backgroundColor: `${theme.primary}08`,
            }}
          >
            <Text className="text-center text-sm leading-6 text-ethereal-ink/45">
              Your schedule is clear for today. Add a task to plan your focus blocks.
            </Text>
            <View style={styles.addTaskCenter}>
              <AddTaskPillButton fullWidth onPress={handleAddTask} />
            </View>
          </View>
        ) : (
          <View>
            <View className="gap-0.5">
              {schedule.map((item, index) => (
                <View
                  key={item.id}
                  className={`flex-row items-center rounded-xl px-1 py-3.5 ${
                    index < schedule.length - 1 ? 'border-b' : ''
                  }`}
                  style={
                    index < schedule.length - 1
                      ? { borderBottomColor: theme.borderSubtle, borderBottomWidth: 1 }
                      : undefined
                  }
                >
                  <ScheduleCheckbox
                    checked={item.completed}
                    onToggle={() => onToggleItem(item.id)}
                    accessibilityLabel={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                  />
                  <View className="ml-3.5 flex-1">
                    <Text
                      className={`text-base font-semibold ${
                        item.completed ? 'text-ethereal-ink/45 line-through' : 'text-ethereal-ink'
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-xs text-ethereal-slate">{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.addTaskCenter}>
              <AddTaskPillButton onPress={handleAddTask} />
            </View>
          </View>
        )}
      </View>
    </GlassPanel>
  );
}
