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
import { logWeight } from '../../lib/health/weightService';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useHealthStore } from '../../stores/useHealthStore';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

type WeightMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  initialWeight?: string;
};

export function WeightMiniForm({ onSuccess, onBack, initialWeight = '' }: WeightMiniFormProps) {
  const { theme } = useTheme();
  const { text, surfaces } = useThemedStyles();
  const currentWeight = useHealthStore((s) => s.bodyStats.weightKg);
  const [weight, setWeight] = useState(initialWeight || (currentWeight > 0 ? String(currentWeight) : ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const parsed = Number.parseFloat(weight.replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0 || isSubmitting) {
      setError('Enter a valid weight in kg.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const userId = useGamificationStore.getState().profile?.id;
      if (!userId) {
        throw new Error('You must be signed in to log weight.');
      }

      await logWeight(userId, parsed);
      useHealthStore.setState((state) => ({
        bodyStats: {
          ...state.bodyStats,
          weightKg: Math.round(parsed * 10) / 10,
        },
      }));
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
        value={weight}
        onChangeText={setWeight}
        placeholder="Weight (kg)"
        placeholderTextColor={theme.textMuted}
        keyboardType="decimal-pad"
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderSubtle }]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={onBack} style={[styles.secondaryButton, { borderColor: theme.borderSubtle }]}>
          <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => void handleSave()}
          disabled={isSubmitting}
          style={[styles.primaryButton, { backgroundColor: theme.primary, opacity: isSubmitting ? 0.55 : 1 }]}
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
    marginBottom: 12,
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
