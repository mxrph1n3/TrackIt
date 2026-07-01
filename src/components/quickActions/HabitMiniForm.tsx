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
import { insertHabit, toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

type HabitMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  initialTitle?: string;
};

export function HabitMiniForm({ onSuccess, onBack, initialTitle = '' }: HabitMiniFormProps) {
  const { theme } = useTheme();
  const { text, surfaces } = useThemedStyles();
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await insertHabit(trimmed);
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Name</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Meditation 10 min"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderSubtle }]}
        autoFocus
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable onPress={onBack} style={[styles.secondaryButton, { borderColor: theme.borderSubtle }]}>
          <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleCreate()}
          disabled={!title.trim() || isSubmitting}
          style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: !title.trim() || isSubmitting ? 0.55 : 1 }]}
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
  container: { paddingTop: 4 },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  error: { color: '#F87171', fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryText: { fontSize: 14, fontWeight: '600' },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    minHeight: 48,
  },
  primaryText: { fontSize: 14, fontWeight: '700' },
});
