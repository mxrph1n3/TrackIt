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
import { appendJournalNote, toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

type NoteMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  initialBody?: string;
};

export function NoteMiniForm({ onSuccess, onBack, initialBody = '' }: NoteMiniFormProps) {
  const { theme } = useTheme();
  const { text, surfaces } = useThemedStyles();
  const [body, setBody] = useState(initialBody);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = body.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await appendJournalNote(trimmed);
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Text, checklist, or link…"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderSubtle }]}
        multiline
        autoFocus
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable onPress={onBack} style={[styles.secondaryButton, { borderColor: theme.borderSubtle }]}>
          <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleSave()}
          disabled={!body.trim() || isSubmitting}
          style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: !body.trim() || isSubmitting ? 0.55 : 1 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={surfaces.onPrimary} />
          ) : (
            <Text style={[text.onBrand, styles.primaryText]}>Save</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 120,
    textAlignVertical: 'top',
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
