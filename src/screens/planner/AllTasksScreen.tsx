import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';

import { ScheduleCheckbox } from '../../components/dashboard/ScheduleCheckbox';
import { PlannerPremiumCard } from '../../components/planner/PlannerPremiumCard';
import { SubtaskInlineAdd } from '../../components/planner/SubtaskInlineAdd';
import { useAllTasksData } from '../../hooks/useAllTasksData';
import type { TaskListFilter } from '../../lib/planner/service';
import { hasPartialSubtaskProgress } from '../../lib/planner/presentation';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import { usePlannerNavigationStore } from '../../stores/usePlannerNavigationStore';
import { BRAND } from '../../theme/designTokens';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';

const FILTERS: Array<{ id: TaskListFilter; label: string }> = [
  { id: 'open', label: 'Open' },
  { id: 'all', label: 'All' },
  { id: 'done', label: 'Done' },
];

export function AllTasksScreen() {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const closeAllTasks = usePlannerNavigationStore((state) => state.closeAllTasks);
  const { tasks, filter, setFilter, isLoading, toggleTask, toggleSubtask, addSubtask } =
    useAllTasksData('open');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: 'transparent' },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        },
        back: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.primaryNeon,
        },
        title: {
          flex: 1,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: '800',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: theme.textPrimary,
        },
        headerSpacer: { width: 40 },
        filters: {
          flexDirection: 'row',
          gap: 8,
          marginBottom: 16,
        },
        filterChip: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.chip,
        },
        filterChipActive: {
          backgroundColor: `${theme.primary}26`,
          borderColor: `${theme.primary}55`,
        },
        filterText: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        filterTextActive: {
          color: theme.primaryNeon,
        },
        loading: {
          alignItems: 'center',
          paddingVertical: 48,
        },
        empty: {
          paddingHorizontal: 18,
          paddingVertical: 24,
          alignItems: 'center',
        },
        emptyTitle: {
          fontSize: 15,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        emptyBody: {
          marginTop: 6,
          fontSize: 13,
          fontWeight: '500',
          color: theme.textMuted,
          textAlign: 'center',
        },
        taskWrap: { marginBottom: 10 },
        taskCard: {
          paddingHorizontal: 18,
          paddingVertical: 14,
        },
        taskRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        taskCopy: { flex: 1 },
        taskTitle: {
          fontSize: 15,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        taskTitleDone: {
          color: theme.textMuted,
          textDecorationLine: 'line-through',
        },
        taskMeta: {
          marginTop: 2,
          fontSize: 12,
          fontWeight: '500',
          color: theme.textSecondary,
        },
        progressPill: {
          minWidth: 42,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: `${theme.primary}22`,
          alignItems: 'center',
        },
        progressText: {
          fontSize: 11,
          fontWeight: '700',
          color: theme.primaryNeon,
        },
        subtaskRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
          marginLeft: 12,
          paddingLeft: 8,
          borderLeftWidth: 1,
          borderLeftColor: theme.borderSubtle,
        },
        subtaskTitle: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: theme.textSecondary,
        },
      }),
    [isDark, surfaces.chip, theme],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: scrollContentPaddingBottom,
          paddingHorizontal: 20,
        }}
      >
        <View style={styles.header}>
          <Pressable onPress={closeAllTasks} hitSlop={8}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
          <Text style={styles.title}>All Tasks</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.filters}>
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading && tasks.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={BRAND.primary} />
          </View>
        ) : tasks.length === 0 ? (
          <PlannerPremiumCard>
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No tasks here</Text>
              <Text style={styles.emptyBody}>
                {filter === 'done'
                  ? 'Completed tasks will show up in this list.'
                  : 'Open Action Hub to create your first task.'}
              </Text>
            </View>
          </PlannerPremiumCard>
        ) : (
          tasks.map((task) => {
            const partialSubtasks = hasPartialSubtaskProgress(task.subtasks);
            const completedSubtasks = task.subtasks?.filter((item) => item.completed).length ?? 0;
            const totalSubtasks = task.subtasks?.length ?? 0;

            return (
              <View key={task.id} style={styles.taskWrap}>
                <PlannerPremiumCard>
                <View style={styles.taskCard}>
                  <View style={styles.taskRow}>
                    <ScheduleCheckbox
                      checked={task.completed}
                      indeterminate={partialSubtasks}
                      onToggle={() => void toggleTask(task.id)}
                      accessibilityLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <View style={styles.taskCopy}>
                      <Text
                        style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
                        numberOfLines={2}
                      >
                        {task.title}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {task.dayLabel ?? 'Scheduled'} · {task.time}
                      </Text>
                    </View>
                    {totalSubtasks > 0 ? (
                      <View style={styles.progressPill}>
                        <Text style={styles.progressText}>
                          {completedSubtasks}/{totalSubtasks}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {task.subtasks?.map((subtask) => (
                    <View key={subtask.id} style={styles.subtaskRow}>
                      <ScheduleCheckbox
                        checked={subtask.completed}
                        onToggle={() => void toggleSubtask(task.id, subtask.id)}
                        accessibilityLabel={`Mark ${subtask.title} as ${subtask.completed ? 'incomplete' : 'complete'}`}
                      />
                      <Text
                        style={[styles.subtaskTitle, subtask.completed && styles.taskTitleDone]}
                        numberOfLines={1}
                      >
                        {subtask.title}
                      </Text>
                    </View>
                  ))}

                  {!task.completed ? (
                    <SubtaskInlineAdd onAdd={(title) => addSubtask(task.id, title)} />
                  ) : null}
                </View>
                </PlannerPremiumCard>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
