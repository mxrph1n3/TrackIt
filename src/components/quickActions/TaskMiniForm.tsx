import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { finalizeQuickActionSuccess } from '../../lib/quickActions/finalize';
import { insertTask, toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useTasksSyncStore } from '../../stores/useTasksSyncStore';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ObsidianTheme } from '../../theme/obsidian';

type TaskMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  initialTitle?: string;
  initialScheduledTime?: string;
  initialIsToday?: boolean;
};

export function TaskMiniForm({
  onSuccess,
  onBack,
  initialTitle = '',
  initialScheduledTime,
  initialIsToday = true,
}: TaskMiniFormProps) {
  const { text, surfaces } = useThemedStyles();
  const [title, setTitle] = useState(initialTitle);
  const [isToday, setIsToday] = useState(initialIsToday);
  const [scheduledTime, setScheduledTime] = useState(initialScheduledTime ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addScheduleItem = useDashboardStore((s) => s.addScheduleItem);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const row = await insertTask({
        title: trimmed,
        isToday,
        scheduledTime: scheduledTime.trim() || undefined,
      });

      if (isToday) {
        addScheduleItem({
          id: row.id,
          title: row.title,
          time: scheduledTime.trim() || 'Anytime',
          completed: false,
        });
      }

      useTasksSyncStore.getState().notifyTaskMutation();
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Quick Task</Text>
      <Text style={styles.heading}>Create a task</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to get done?"
        placeholderTextColor={ObsidianTheme.textMuted}
        style={styles.input}
        autoFocus
        returnKeyType="next"
      />

      <Text style={styles.label}>Time</Text>
      <TextInput
        value={scheduledTime}
        onChangeText={setScheduledTime}
        placeholder="18:00"
        placeholderTextColor={ObsidianTheme.textMuted}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={() => void handleCreate()}
      />

      <Text style={styles.label}>Today?</Text>
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setIsToday(true)}
          style={[styles.toggleChip, isToday && styles.toggleChipActive]}
        >
          <Text style={[styles.toggleText, isToday && styles.toggleTextActive]}>Yes</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsToday(false)}
          style={[styles.toggleChip, !isToday && styles.toggleChipActive]}
        >
          <Text style={[styles.toggleText, !isToday && styles.toggleTextActive]}>No</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleCreate()}
          disabled={!title.trim() || isSubmitting}
          style={[styles.primaryButton, (!title.trim() || isSubmitting) && styles.disabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={surfaces.onPrimary} />
          ) : (
            <Text style={[text.onBrand, styles.primaryText]}>Create</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  kicker: {
    color: ObsidianTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heading: {
    color: ObsidianTheme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 18,
  },
  label: {
    color: ObsidianTheme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: ObsidianTheme.border,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: ObsidianTheme.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  toggleChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ObsidianTheme.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  toggleChipActive: {
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
  },
  toggleText: {
    color: ObsidianTheme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: ObsidianTheme.textPrimary,
  },
  error: {
    color: '#F87171',
    fontSize: 13,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ObsidianTheme.border,
  },
  secondaryText: {
    color: ObsidianTheme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: ObsidianTheme.primary,
    minHeight: 48,
  },
  disabled: {
    opacity: 0.55,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
