import { Plus } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { ScheduleCheckbox } from '../dashboard/ScheduleCheckbox';
import type { DayAgenda } from '../../types/planner';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PLANNER_COPY } from './plannerTheme';

type PlannerTodayFocusCardProps = {
  agenda: DayAgenda;
  isJournalEmpty: boolean;
  onAddJournal: () => void;
  onEditJournal: () => void;
  onToggleHabit: (habitId: string) => void;
};

export function PlannerTodayFocusCard({
  agenda,
  isJournalEmpty,
  onAddJournal,
  onEditJournal,
  onToggleHabit,
}: PlannerTodayFocusCardProps) {
  const { styles: plannerStyles, theme, surfaces } = usePlannerTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        addJournal: {
          marginTop: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 16,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: surfaces.dashedBorder,
          backgroundColor: surfaces.openButton,
          paddingVertical: 12,
          paddingHorizontal: 14,
        },
        addJournalText: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.textSecondary,
        },
        habitsBlock: {
          marginTop: 16,
          paddingTop: 14,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: surfaces.divider,
          gap: 10,
        },
        habitsKicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        habitRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        habitLabel: {
          flex: 1,
          fontSize: 14,
          fontWeight: '600',
          color: theme.textPrimary,
        },
        habitDone: {
          color: theme.textMuted,
          textDecorationLine: 'line-through',
        },
      }),
    [surfaces, theme],
  );

  const completedHabits = agenda.habits.filter((habit) => habit.completed).length;
  const habitSubtitle =
    agenda.habits.length > 0
      ? `${completedHabits} of ${agenda.habits.length} habits`
      : 'Habits for today';

  return (
    <PlannerPremiumCard>
      <View style={plannerStyles.moduleInner}>
        <PlannerSectionHeader
          title={PLANNER_COPY.todayFocus}
          subtitle={habitSubtitle}
          actionLabel={isJournalEmpty ? undefined : PLANNER_COPY.editJournal}
          onAction={isJournalEmpty ? undefined : onEditJournal}
        />

        <Text
          style={[plannerStyles.body, isJournalEmpty && plannerStyles.bodyMuted]}
          numberOfLines={4}
        >
          {isJournalEmpty
            ? 'Write today\'s goal, focus, or a short reflection — it sets the rhythm for your whole ecosystem.'
            : agenda.journal.body}
        </Text>

        {isJournalEmpty ? (
          <Pressable onPress={onAddJournal} style={styles.addJournal}>
            <Plus color={theme.textSecondary} size={16} strokeWidth={2.2} />
            <Text style={styles.addJournalText}>{PLANNER_COPY.addJournal}</Text>
          </Pressable>
        ) : null}

        {agenda.habits.length > 0 ? (
          <View style={styles.habitsBlock}>
            <Text style={styles.habitsKicker}>{PLANNER_COPY.habits}</Text>
            {agenda.habits.map((habit) => (
              <View key={habit.id} style={styles.habitRow}>
                <ScheduleCheckbox
                  checked={habit.completed}
                  onToggle={() => onToggleHabit(habit.id)}
                  accessibilityLabel={`Mark habit ${habit.label} as ${habit.completed ? 'incomplete' : 'complete'}`}
                />
                <Text
                  style={[styles.habitLabel, habit.completed && styles.habitDone]}
                  numberOfLines={1}
                >
                  {habit.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </PlannerPremiumCard>
  );
}
