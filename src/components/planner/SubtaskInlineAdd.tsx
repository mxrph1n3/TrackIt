import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { BRAND } from '../../theme/designTokens';

type SubtaskInlineAddProps = {
  onAdd: (title: string) => void | Promise<void>;
  disabled?: boolean;
};

export function SubtaskInlineAdd({ onAdd, disabled = false }: SubtaskInlineAddProps) {
  const { theme, surfaces } = usePlannerTheme();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        addTrigger: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
          marginLeft: 34,
        },
        addTriggerText: {
          fontSize: 12,
          fontWeight: '600',
          color: BRAND.primary,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
          marginLeft: 34,
        },
        input: {
          flex: 1,
          borderWidth: 1,
          borderColor: surfaces.border,
          borderRadius: 12,
          backgroundColor: surfaces.chipStrong,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 13,
          color: theme.textPrimary,
        },
        addButton: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: BRAND.primary,
        },
        addButtonText: {
          fontSize: 12,
          fontWeight: '700',
          color: '#fff',
        },
        disabled: {
          opacity: 0.5,
        },
      }),
    [surfaces, theme],
  );

  const handleAdd = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle('');
      setExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        disabled={disabled}
        style={[styles.addTrigger, disabled && styles.disabled]}
        hitSlop={6}
      >
        <Plus color={BRAND.primary} size={14} strokeWidth={2.5} />
        <Text style={styles.addTriggerText}>Add subtask</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Subtask title"
        placeholderTextColor={theme.textMuted}
        style={styles.input}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => void handleAdd()}
        editable={!isSubmitting}
      />
      <Pressable
        onPress={() => void handleAdd()}
        disabled={!title.trim() || isSubmitting}
        style={[styles.addButton, (!title.trim() || isSubmitting) && styles.disabled]}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
}
