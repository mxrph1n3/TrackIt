import { ChevronRight } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { ScheduleCheckbox } from '../dashboard/ScheduleCheckbox';
import { BRAND } from '../../theme/designTokens';
import type { PlannerPrioritizedTask } from '../../types/planner';
import { hasPartialSubtaskProgress } from '../../lib/planner/presentation';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PlannerTaskActionButtons } from './PlannerTaskActionButtons';
import { SubtaskInlineAdd } from './SubtaskInlineAdd';
import { PLANNER_COPY } from './plannerTheme';

type PrioritizedTasksSectionProps = {
  tasks: PlannerPrioritizedTask[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void | Promise<void>;
  onAddTask?: () => void;
  onViewAll?: () => void;
};

function SubtaskProgress({
  completed,
  total,
  styles,
}: {
  completed: number;
  total: number;
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  const isComplete = total > 0 && completed === total;

  return (
    <View style={[styles.progressPill, isComplete && styles.progressPillComplete]}>
      <Text style={[styles.progressText, isComplete && styles.progressTextComplete]}>
        {completed}/{total}
      </Text>
    </View>
  );
}

export function PrioritizedTasksSection({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onAddSubtask,
  onAddTask,
  onViewAll,
}: PrioritizedTasksSectionProps) {
  const { theme, surfaces, isDark } = usePlannerTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        inner: {
          paddingHorizontal: 18,
          paddingTop: 18,
          paddingBottom: 16,
        },
        actionBar: {
          marginBottom: 14,
        },
        taskCard: {
          borderRadius: 18,
          borderWidth: 1,
          borderColor: surfaces.border,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 14,
          paddingVertical: 12,
        },
        taskGap: {
          marginBottom: 10,
        },
        taskRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        taskCopy: {
          flex: 1,
        },
        taskTitle: {
          fontSize: 15,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        taskTitleDone: {
          color: theme.textMuted,
          textDecorationLine: 'line-through',
        },
        taskTime: {
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
          backgroundColor: isDark ? 'rgba(119, 93, 216, 0.22)' : `${BRAND.primaryLight}33`,
          alignItems: 'center',
        },
        progressPillComplete: {
          backgroundColor: isDark ? 'rgba(52, 211, 153, 0.22)' : 'rgba(52, 211, 153, 0.18)',
        },
        progressText: {
          fontSize: 11,
          fontWeight: '700',
          color: isDark ? '#C4B5FD' : BRAND.primaryDeep,
        },
        progressTextComplete: {
          color: isDark ? '#6EE7B7' : '#059669',
        },
        subtaskRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
          marginLeft: 12,
          paddingLeft: 8,
          borderLeftWidth: 1,
          borderLeftColor: surfaces.divider,
        },
        subtaskTitle: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        empty: {
          borderRadius: 18,
          borderWidth: 1,
          borderColor: surfaces.border,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 16,
          paddingVertical: 20,
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
          lineHeight: 20,
        },
        emptyActions: {
          marginTop: 16,
          width: '100%',
        },
      }),
    [isDark, surfaces, theme],
  );

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalSubtasks = tasks.reduce((sum, task) => sum + (task.subtasks?.length ?? 0), 0);
  const completedSubtasks = tasks.reduce(
    (sum, task) => sum + (task.subtasks?.filter((item) => item.completed).length ?? 0),
    0,
  );

  return (
    <PlannerPremiumCard>
      <View style={styles.inner}>
        <PlannerSectionHeader
          title={PLANNER_COPY.tasks}
          subtitle={
            tasks.length === 0
              ? 'Plan your day'
              : `${completedTasks}/${tasks.length} tasks${
                  totalSubtasks > 0 ? ` · ${completedSubtasks}/${totalSubtasks} subtasks` : ''
                }`
          }
          actionLabel={onViewAll ? PLANNER_COPY.viewAll : undefined}
          onAction={onViewAll}
        />

        {onAddTask && tasks.length > 0 ? (
          <View style={styles.actionBar}>
            <PlannerTaskActionButtons onAddTask={onAddTask} />
          </View>
        ) : null}

        {tasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{PLANNER_COPY.noTasks}</Text>
            <Text style={styles.emptyBody}>
              Start with one clear task — you can add subtasks while creating it.
            </Text>
            {onAddTask ? (
              <View style={styles.emptyActions}>
                <PlannerTaskActionButtons onAddTask={onAddTask} />
              </View>
            ) : null}
          </View>
        ) : (
          tasks.map((task, index) => {
          const completedSubtasks = task.subtasks?.filter((item) => item.completed).length ?? 0;
          const totalSubtasks = task.subtasks?.length ?? 0;
          const partialSubtasks = hasPartialSubtaskProgress(task.subtasks);

          return (
            <View key={task.id} style={[styles.taskCard, index < tasks.length - 1 && styles.taskGap]}>
              <View style={styles.taskRow}>
                <ScheduleCheckbox
                  checked={task.completed}
                  indeterminate={partialSubtasks}
                  onToggle={() => onToggleTask(task.id)}
                  accessibilityLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <View style={styles.taskCopy}>
                  <Text
                    style={[styles.taskTitle, task.completed && styles.taskTitleDone]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </Text>
                  {task.time ? <Text style={styles.taskTime}>{task.time}</Text> : null}
                </View>
                {totalSubtasks > 0 ? (
                  <SubtaskProgress completed={completedSubtasks} total={totalSubtasks} styles={styles} />
                ) : (
                  <ChevronRight color={theme.textMuted} size={18} />
                )}
              </View>

              {task.subtasks?.map((subtask) => (
                <View key={subtask.id} style={styles.subtaskRow}>
                  <ScheduleCheckbox
                    checked={subtask.completed}
                    onToggle={() => onToggleSubtask?.(task.id, subtask.id)}
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
                <SubtaskInlineAdd
                  onAdd={(title) => onAddSubtask?.(task.id, title)}
                  disabled={!onAddSubtask}
                />
              ) : null}
            </View>
          );
        })
        )}
      </View>
    </PlannerPremiumCard>
  );
}
