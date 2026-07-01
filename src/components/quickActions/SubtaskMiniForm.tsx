import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { finalizeQuickActionSuccess } from '../../lib/quickActions/finalize';
import { toQuickActionErrorMessage } from '../../lib/quickActions/service';
import {
  fetchOpenTasksForSubtask,
  insertSubtask,
} from '../../lib/planner/subtaskService';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ObsidianTheme } from '../../theme/obsidian';

type SubtaskMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  initialTitle?: string;
};

export function SubtaskMiniForm({
  onSuccess,
  onBack,
  initialTitle = '',
}: SubtaskMiniFormProps) {
  const { text, surfaces } = useThemedStyles();
  const userId = useGamificationStore((state) => state.profile?.id);
  const [title, setTitle] = useState(initialTitle);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [parentTasks, setParentTasks] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setParentTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const tasks = await fetchOpenTasksForSubtask(userId);
        if (!cancelled) {
          setParentTasks(tasks);
          setParentTaskId(tasks[0]?.id ?? null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(toQuickActionErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTasks(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed || !parentTaskId || !userId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await insertSubtask(userId, parentTaskId, trimmed);
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Quick Subtask</Text>
      <Text style={styles.heading}>Add to a task</Text>

      <Text style={styles.label}>Parent task</Text>
      {isLoadingTasks ? (
        <ActivityIndicator color={ObsidianTheme.primary} style={styles.loader} />
      ) : parentTasks.length === 0 ? (
        <Text style={styles.emptyHint}>No open tasks yet. Create a task first.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {parentTasks.map((task) => {
            const active = task.id === parentTaskId;
            return (
              <Pressable
                key={task.id}
                onPress={() => setParentTaskId(task.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                  {task.title}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Text style={styles.label}>Subtask</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to get done?"
        placeholderTextColor={ObsidianTheme.textMuted}
        style={styles.input}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => void handleCreate()}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={onBack} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleCreate()}
          disabled={!title.trim() || !parentTaskId || isSubmitting}
          style={[styles.primaryButton, (!title.trim() || !parentTaskId || isSubmitting) && styles.disabled]}
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
  loader: {
    marginBottom: 16,
  },
  emptyHint: {
    color: ObsidianTheme.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  chips: {
    gap: 8,
    marginBottom: 16,
    paddingRight: 8,
  },
  chip: {
    maxWidth: 180,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ObsidianTheme.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chipActive: {
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
  },
  chipText: {
    color: ObsidianTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: ObsidianTheme.textPrimary,
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
