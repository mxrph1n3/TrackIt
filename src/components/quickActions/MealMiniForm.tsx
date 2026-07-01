import { useState } from 'react';
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
import { logMealQuick, toQuickActionErrorMessage } from '../../lib/quickActions/service';
import { fetchTodayNutrition } from '../../lib/health/nutritionService';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useHealthStore } from '../../stores/useHealthStore';
import type { MealSlot } from '../../types/health';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../theme/ThemeContext';

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
] as const;

type MealMiniFormProps = {
  onSuccess: () => void;
  onBack: () => void;
  initialMealName?: string;
  initialCalories?: string;
};

export function MealMiniForm({
  onSuccess,
  onBack,
  initialMealName = '',
  initialCalories = '',
}: MealMiniFormProps) {
  const { theme } = useTheme();
  const { text, surfaces } = useThemedStyles();
  const [slot, setSlot] = useState<(typeof MEAL_SLOTS)[number]['id']>('breakfast');
  const [mealName, setMealName] = useState(initialMealName);
  const [calories, setCalories] = useState(initialCalories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = mealName.trim();
    const parsedCalories = Number.parseInt(calories, 10);
    if (!trimmed || !Number.isFinite(parsedCalories) || parsedCalories <= 0 || isSubmitting) {
      setError('Enter a meal name and calories.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await logMealQuick({
        slot,
        mealName: trimmed,
        calories: parsedCalories,
      });
      const userId = useGamificationStore.getState().profile?.id;
      if (userId) {
        const snapshot = await fetchTodayNutrition(userId);
        useHealthStore.getState().hydrateNutrition(snapshot);
      } else {
        useHealthStore.getState().logQuickMeal(slot, trimmed, parsedCalories);
      }
      await finalizeQuickActionSuccess(onSuccess);
    } catch (submitError) {
      setError(toQuickActionErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotRow}>
        {MEAL_SLOTS.map((item) => {
          const active = slot === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setSlot(item.id)}
              style={[
                styles.slotChip,
                {
                  borderColor: active ? theme.primary : theme.borderSubtle,
                  backgroundColor: active ? `${theme.primary}18` : `${theme.primary}08`,
                },
              ]}
            >
              <Text style={{ color: active ? theme.primary : theme.textSecondary, fontWeight: '600', fontSize: 13 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <TextInput
        value={mealName}
        onChangeText={setMealName}
        placeholder="Meal name"
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderSubtle }]}
      />

      <TextInput
        value={calories}
        onChangeText={setCalories}
        placeholder="Calories"
        placeholderTextColor={theme.textMuted}
        keyboardType="number-pad"
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
            <Text style={[text.onBrand, styles.primaryText]}>Add</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 4 },
  slotRow: { gap: 8, marginBottom: 14 },
  slotChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
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
