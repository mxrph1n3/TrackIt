import { LinearGradient } from 'expo-linear-gradient';
import { ListTree, Plus, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAvoidingViewCompat } from '../../lib/platform/keyboard';

import { useBottomSheetLayout } from '../../hooks/useBottomSheetLayout';
import { usePlannerSheetStyles } from '../../hooks/usePlannerSheetStyles';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { BRAND } from '../../theme/designTokens';
import { useTheme } from '../../theme/ThemeContext';
import { DismissibleOverlay } from '../ui/DismissibleOverlay';
import { formatTaskScheduleLabel, TaskSchedulePicker } from './TaskSchedulePicker';

type TaskCreationSheetProps = {
  visible: boolean;
  initialDayKey: string;
  onClose: () => void;
  onSubmit: (title: string, dueDate: string, subtasks: string[]) => void | Promise<void>;
};

const TITLE_MAX = 120;

export function TaskCreationSheet({
  visible,
  initialDayKey,
  onClose,
  onSubmit,
}: TaskCreationSheetProps) {
  const { footerPaddingBottom } = useBottomSheetLayout();
  const { height: windowHeight } = useWindowDimensions();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const { styles: sheetStyles } = usePlannerSheetStyles();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(initialDayKey);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [isSubtaskInputOpen, setIsSubtaskInputOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDueDate(initialDayKey);
      setSubtasks([]);
      setSubtaskDraft('');
      setIsSubtaskInputOpen(false);
      setError(null);
    }
  }, [initialDayKey, visible]);

  const canSave = title.trim().length > 0 && !isSubmitting;
  const sheetMaxHeight = Math.round(windowHeight * 0.92);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        sheet: {
          width: '100%',
          flexDirection: 'column',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: isDark ? theme.cardFrosted : '#FFFFFF',
          ...Platform.select({
            ios: {
              shadowColor: theme.shadowColor,
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: isDark ? 0.35 : 0.12,
              shadowRadius: 24,
            },
            android: { elevation: 16 },
          }),
        },
        handle: {
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: 999,
          backgroundColor: theme.borderSubtle,
          marginTop: 10,
          marginBottom: 6,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
        },
        headerCopy: {
          flex: 1,
          paddingRight: 12,
        },
        headerTitle: {
          fontSize: 22,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: -0.4,
        },
        headerSubtitle: {
          marginTop: 4,
          fontSize: 13,
          fontWeight: '500',
          lineHeight: 19,
          color: theme.textMuted,
        },
        closeButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surfaces.chip,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
        },
        scroll: {
          flexShrink: 1,
        },
        scrollContent: {
          paddingHorizontal: 20,
          paddingBottom: 12,
        },
        sectionLabel: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.8,
          textTransform: 'uppercase',
          color: theme.textMuted,
          marginBottom: 10,
        },
        titleInput: {
          minHeight: 64,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.inset,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 18,
          fontWeight: '700',
          lineHeight: 24,
          color: theme.textPrimary,
        },
        counter: {
          alignSelf: 'flex-end',
          fontSize: 11,
          fontWeight: '600',
          color: theme.textMuted,
          marginTop: 8,
          marginBottom: 14,
        },
        subtasksCard: {
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: surfaces.inset,
          padding: 14,
          marginBottom: 4,
        },
        subtasksHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        },
        subtasksTitle: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        subtasksHint: {
          fontSize: 12,
          lineHeight: 18,
          color: theme.textMuted,
          marginBottom: 12,
        },
        subtaskChip: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 14,
          backgroundColor: isDark ? theme.card : '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginBottom: 8,
        },
        subtaskChipText: {
          flex: 1,
          fontSize: 14,
          fontWeight: '600',
          color: theme.textPrimary,
        },
        subtaskRemove: {
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surfaces.chip,
        },
        addSubtaskButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 14,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: `${BRAND.primary}44`,
          backgroundColor: `${BRAND.primary}08`,
          paddingVertical: 12,
          paddingHorizontal: 14,
        },
        addSubtaskLabel: {
          fontSize: 14,
          fontWeight: '700',
          color: BRAND.primary,
        },
        subtaskInputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        subtaskInput: {
          flex: 1,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          backgroundColor: isDark ? theme.card : '#FFFFFF',
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontSize: 14,
          color: theme.textPrimary,
        },
        subtaskAddButton: {
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderRadius: 14,
          backgroundColor: BRAND.primary,
        },
        subtaskAddLabel: {
          fontSize: 13,
          fontWeight: '800',
          color: '#FFFFFF',
        },
        footer: {
          paddingHorizontal: 20,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.borderSubtle,
          backgroundColor: isDark ? theme.cardFrosted : '#FFFFFF',
        },
        createButton: {
          borderRadius: 18,
          overflow: 'hidden',
        },
        createButtonInner: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 16,
          minHeight: 54,
        },
        createLabel: {
          fontSize: 16,
          fontWeight: '800',
          color: '#FFFFFF',
          letterSpacing: 0.3,
        },
      }),
    [isDark, surfaces, theme],
  );

  const handleAddSubtask = () => {
    const trimmed = subtaskDraft.trim();
    if (!trimmed) {
      return;
    }
    setSubtasks((current) => [...current, trimmed]);
    setSubtaskDraft('');
    setIsSubtaskInputOpen(true);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) {
      setError('Enter a task title.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed, dueDate, subtasks);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not add task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DismissibleOverlay
      visible={visible}
      onDismiss={onClose}
      placement="bottom"
      isolateContent
      blurIntensity={theme.sheetBlurIntensity}
      scrimColor={isDark ? 'rgba(0, 0, 0, 0.82)' : 'rgba(30, 26, 62, 0.52)'}
      disabled={isSubmitting}
      accessibilityLabel="Close task creator"
      contentStyle={{ paddingHorizontal: 0 }}
    >
      <KeyboardAvoidingViewCompat behavior="padding" style={{ width: '100%' }}>
        <View style={[styles.sheet, { maxHeight: sheetMaxHeight, paddingBottom: footerPaddingBottom }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>New Task</Text>
              <Text style={styles.headerSubtitle}>Name it, choose when it&apos;s due, add steps if needed.</Text>
            </View>
            <Pressable
              onPress={onClose}
              disabled={isSubmitting}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X color={theme.textPrimary} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            <Text style={styles.sectionLabel}>Task name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to get done?"
              placeholderTextColor={theme.textMuted}
              style={styles.titleInput}
              autoFocus
              maxLength={TITLE_MAX}
              multiline
              returnKeyType="next"
            />
            <Text style={styles.counter}>
              {title.length}/{TITLE_MAX}
            </Text>

            {visible ? (
              <TaskSchedulePicker value={dueDate} onChange={setDueDate} />
            ) : null}

            <Text style={styles.sectionLabel}>Subtasks</Text>
            <View style={styles.subtasksCard}>
              <View style={styles.subtasksHeader}>
                <ListTree color={BRAND.primary} size={16} strokeWidth={2.2} />
                <Text style={styles.subtasksTitle}>Break it down</Text>
              </View>
              <Text style={styles.subtasksHint}>Optional steps to make the task easier to finish.</Text>

              {subtasks.map((subtask, index) => (
                <View key={`${subtask}-${index}`} style={styles.subtaskChip}>
                  <Text style={styles.subtaskChipText} numberOfLines={2}>
                    {subtask}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveSubtask(index)}
                    style={styles.subtaskRemove}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove subtask ${subtask}`}
                  >
                    <X color={theme.textMuted} size={14} strokeWidth={2.4} />
                  </Pressable>
                </View>
              ))}

              {isSubtaskInputOpen ? (
                <View style={styles.subtaskInputRow}>
                  <TextInput
                    value={subtaskDraft}
                    onChangeText={setSubtaskDraft}
                    placeholder="Subtask title"
                    placeholderTextColor={theme.textMuted}
                    style={styles.subtaskInput}
                    autoFocus={subtasks.length === 0}
                    returnKeyType="done"
                    onSubmitEditing={handleAddSubtask}
                  />
                  <Pressable
                    onPress={handleAddSubtask}
                    disabled={!subtaskDraft.trim()}
                    style={[styles.subtaskAddButton, !subtaskDraft.trim() && { opacity: 0.45 }]}
                  >
                    <Text style={styles.subtaskAddLabel}>Add</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setIsSubtaskInputOpen(true)}
                  style={styles.addSubtaskButton}
                  accessibilityRole="button"
                  accessibilityLabel="Add subtask"
                >
                  <Plus color={BRAND.primary} size={16} strokeWidth={2.6} />
                  <Text style={styles.addSubtaskLabel}>Add subtask</Text>
                </Pressable>
              )}
            </View>

            {error ? <Text style={sheetStyles.error}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={() => void handleSubmit()}
              disabled={!canSave}
              style={[styles.createButton, !canSave && { opacity: 0.5 }]}
              accessibilityRole="button"
              accessibilityLabel="Create task"
            >
              <LinearGradient
                colors={canSave ? ['#A78BFA', '#775DD8', '#6366F1'] : ['#9CA3AF', '#9CA3AF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonInner}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createLabel}>
                    {subtasks.length > 0
                      ? `Create for ${formatTaskScheduleLabel(dueDate)} · ${subtasks.length} steps`
                      : `Create for ${formatTaskScheduleLabel(dueDate)}`}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingViewCompat>
    </DismissibleOverlay>
  );
}
