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
import { toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { insertMoodLog } from '../../lib/health/moodService';
import { useProgression } from '../../hooks/useProgression';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const MOOD_OPTIONS = [
  { score: 1, label: 'Rough', emoji: '😞' },
  { score: 2, label: 'Low', emoji: '😕' },
  { score: 3, label: 'Okay', emoji: '😐' },
  { score: 4, label: 'Good', emoji: '🙂' },
  { score: 5, label: 'Great', emoji: '😄' },
] as const;

type MoodMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
};

export function MoodMiniForm({ onSuccess, onBack }: MoodMiniFormProps) {
  const { theme } = useTheme();
  const { text, surfaces } = useThemedStyles();
  const { awardXp } = useProgression();
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (score == null || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await insertMoodLog(score, note);
      await awardXp('MOOD_LOG');
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((option) => {
          const active = score === option.score;
          return (
            <Pressable
              key={option.score}
              onPress={() => setScore(option.score)}
              style={[
                styles.moodChip,
                { borderColor: theme.borderSubtle },
                active && styles.moodChipActive,
              ]}
            >
              <Text style={styles.moodEmoji}>{option.emoji}</Text>
              <Text style={[styles.moodLabel, { color: theme.textSecondary }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Optional note"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderSubtle }]}
        multiline
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={onBack} style={[styles.secondaryButton, { borderColor: theme.borderSubtle }]}>
          <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleSave()}
          disabled={score == null || isSubmitting}
          style={[styles.primaryButton, (score == null || isSubmitting) && styles.disabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={surfaces.onPrimary} />
          ) : (
            <Text style={[text.onBrand, styles.primaryText]}>Log Mood</Text>
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
  heading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
  },
  moodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  moodChipActive: {
    borderColor: 'rgba(119, 93, 216, 0.55)',
    backgroundColor: 'rgba(119, 93, 216, 0.14)',
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    marginBottom: 12,
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
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#775DD8',
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
