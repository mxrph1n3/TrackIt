import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { fetchOpenTasksForSubtask } from '../../lib/planner/subtaskService';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { BRAND } from '../../theme/designTokens';
import { usePlannerSheetStyles } from '../../hooks/usePlannerSheetStyles';

type SubtaskCreationSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, title: string) => Promise<void>;
  preferredTaskId?: string;
};

export function SubtaskCreationSheet({
  visible,
  onClose,
  onSubmit,
  preferredTaskId,
}: SubtaskCreationSheetProps) {
  const insets = useAppSafeAreaInsets();
  const { styles, theme } = usePlannerSheetStyles();
  const userId = useGamificationStore((state) => state.profile?.id);
  const [title, setTitle] = useState('');
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [parentTasks, setParentTasks] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTitle('');
    setError(null);
    setIsLoadingTasks(true);

    if (!userId) {
      setParentTasks([]);
      setParentTaskId(null);
      setIsLoadingTasks(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const tasks = await fetchOpenTasksForSubtask(userId);
        if (cancelled) {
          return;
        }
        setParentTasks(tasks);
        const preferred = preferredTaskId && tasks.some((task) => task.id === preferredTaskId)
          ? preferredTaskId
          : tasks[0]?.id ?? null;
        setParentTaskId(preferred);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load tasks.');
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
  }, [preferredTaskId, userId, visible]);

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || !parentTaskId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(parentTaskId, trimmed);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not add subtask.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.kicker}>Planner</Text>
          <Text style={styles.title}>Add Subtask</Text>

          <Text style={styles.label}>Parent task</Text>
          {isLoadingTasks ? (
            <ActivityIndicator color={BRAND.primary} style={{ marginBottom: 16 }} />
          ) : parentTasks.length === 0 ? (
            <Text style={styles.hint}>No open tasks yet. Create a task first, then add subtasks.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
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
            placeholder="What step comes next?"
            placeholderTextColor={theme.textMuted}
            style={styles.input}
            autoFocus={parentTasks.length > 0}
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
            editable={!isSubmitting && parentTasks.length > 0}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleSubmit()}
              disabled={!title.trim() || !parentTaskId || isSubmitting}
              style={[
                styles.primaryBtn,
                (!title.trim() || !parentTaskId || isSubmitting) && styles.primaryBtnDisabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryLabel}>Add Subtask</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
