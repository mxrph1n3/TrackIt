import { Plus } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMealById, getMealInstructions, SLOT_LABELS } from '../../constants/meals';
import { resolveMealSlot } from '../../constants/mealSlots';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import type { HealthStackParamList } from '../../navigation/healthTypes';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { PremiumCard } from '../../components/health/ui/PremiumCard';
import { useHealthStore } from '../../stores/useHealthStore';

export function MealDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { pop } = useHealthNavigation();
  const route = useRoute<RouteProp<HealthStackParamList, 'MealDetails'>>();
  const mealSlot = route.params?.mealSlot;
  const previewMealId = route.params?.mealId;
  const mealLog = useHealthStore((s) => s.mealLog);
  const quickMeals = useHealthStore((s) => s.quickMeals);
  const swapMeal = useHealthStore((s) => s.swapMeal);
  const healthTheme = useHealthTheme();

  const loggedMealId = mealSlot ? mealLog[mealSlot] : undefined;
  const mealId = previewMealId ?? loggedMealId;
  const meal = mealId ? getMealById(mealId) : null;
  const isPreview = Boolean(previewMealId);
  const instructions = meal ? getMealInstructions(meal.meal_id) : [];

  const styles = useHealthStyles((t) => ({
    root: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingHorizontal: 20 },
    empty: { color: t.slate, textAlign: 'center', marginTop: 24 },
    mealName: {
      fontSize: 28,
      fontWeight: '900',
      color: t.ink,
      letterSpacing: -0.4,
    },
    calories: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '700',
      color: t.accent,
    },
    macroRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginTop: 20,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 12,
    },
    ingredient: {
      fontSize: 15,
      color: t.ink,
      marginBottom: 8,
      textTransform: 'capitalize',
    },
    stepRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: t.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    stepNumberText: {
      fontSize: 13,
      fontWeight: '800',
      color: t.accent,
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: t.ink,
    },
    addHeaderBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const headerTitle = useMemo(() => {
    if (isPreview) {
      return 'Meal';
    }
    if (mealSlot) {
      return SLOT_LABELS[mealSlot];
    }
    return 'Meal';
  }, [isPreview, mealSlot]);

  const handleAdd = () => {
    if (!meal) {
      return;
    }
    const targetSlot = mealSlot ?? resolveMealSlot(mealLog, quickMeals);
    swapMeal(targetSlot, meal.meal_id);
    pop();
  };

  if (!meal) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingHorizontal: 20 }]}>
        <HealthScreenHeader title="Meal" onBack={pop} />
        <Text style={styles.empty}>Meal not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <HealthScreenHeader
          title={headerTitle}
          onBack={pop}
          rightSlot={
            isPreview ? (
              <Pressable
                onPress={handleAdd}
                style={styles.addHeaderBtn}
                accessibilityRole="button"
                accessibilityLabel={`Add ${meal.name}`}
              >
                <Plus color={healthTheme.ink} size={18} strokeWidth={2.5} />
              </Pressable>
            ) : undefined
          }
        />

        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.calories}>{meal.macros.calories} kcal</Text>

        <PremiumCard>
          <View style={styles.macroRow}>
            <MacroPill label="Protein" value={`${meal.macros.protein}g`} />
            <MacroPill label="Fat" value={`${meal.macros.fat}g`} />
            <MacroPill label="Carbs" value={`${meal.macros.carbs}g`} />
          </View>
        </PremiumCard>

        <Text style={styles.sectionTitle}>How to prepare</Text>
        <PremiumCard>
          {instructions.map((step, index) => (
            <View key={`${meal.meal_id}-step-${index}`} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </PremiumCard>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        <PremiumCard>
          {meal.ingredients.map((ing) => (
            <Text key={ing.id} style={styles.ingredient}>
              · {ing.id.replace(/_/g, ' ')} — {ing.grams}g
            </Text>
          ))}
        </PremiumCard>

        <Text style={styles.sectionTitle}>Details</Text>
        <PremiumCard>
          <Text style={styles.sectionKicker}>Nutrition Facts</Text>
          <FactRow label="Prep time" value={`${meal.prep_time} min`} />
          <FactRow label="Cuisine" value={meal.cuisine} />
          <FactRow label="Tier" value={meal.tier} />
          <FactRow label="Category" value={meal.category} />
        </PremiumCard>
      </ScrollView>
    </View>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  const styles = useHealthStyles((t) => ({
    pill: {
      flex: 1,
      backgroundColor: t.accentSoft,
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
    },
    pillLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: t.slate,
    },
    pillValue: {
      marginTop: 2,
      fontSize: 15,
      fontWeight: '800',
      color: t.ink,
    },
  }));

  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  const styles = useHealthStyles((t) => ({
    factRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: t.cardBorder,
    },
    factLabel: { color: t.slate, fontSize: 14 },
    factValue: { color: t.ink, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  }));

  return (
    <View style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}
