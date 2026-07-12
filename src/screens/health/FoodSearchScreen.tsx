import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search } from 'lucide-react-native';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { getMealLibrary } from '../../constants/meals';
import { getMealInstructions } from '../../constants/mealRecipes';
import { resolveMealSlot } from '../../constants/mealSlots';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { useTodayNutrition } from '../../hooks/useTodayNutrition';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import type { HealthStackParamList } from '../../navigation/healthTypes';
import { useHealthStore } from '../../stores/useHealthStore';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { PremiumCard } from '../../components/health/ui/PremiumCard';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

export function FoodSearchScreen() {
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const route = useRoute<RouteProp<HealthStackParamList, 'FoodSearch'>>();
  const { pop, push } = useHealthNavigation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const swapMeal = useHealthStore((s) => s.swapMeal);
  const { mealLog, quickMeals } = useTodayNutrition();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    root: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingHorizontal: 20 },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.cardBorder,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: t.ink,
      fontWeight: '500',
    },
    chips: { gap: 8, marginBottom: 16 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
    chipActive: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.slate,
    },
    chipTextActive: {
      color: t.ink,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    resultPressable: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resultCopy: { flex: 1 },
    resultName: {
      fontSize: 16,
      fontWeight: '700',
      color: t.ink,
    },
    resultMeta: {
      marginTop: 4,
      fontSize: 13,
      color: t.slate,
    },
    serving: {
      marginTop: 2,
      fontSize: 12,
      color: t.muted,
    },
    recipeHint: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '600',
      color: t.accent,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      textAlign: 'center',
      color: t.slate,
      fontSize: 14,
      marginTop: 24,
    },
  }));

  const targetSlot = useMemo(
    () => resolveMealSlot(mealLog, quickMeals, route.params?.targetSlot),
    [mealLog, quickMeals, route.params?.targetSlot],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getMealLibrary().filter((meal) => {
      const matchesQuery = !q || meal.name.toLowerCase().includes(q);
      const matchesCategory =
        category === 'All' || meal.category === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  const handleQuickAdd = (mealId: string) => {
    swapMeal(targetSlot, mealId);
    pop();
  };

  const handleOpenPreview = (mealId: string) => {
    push('MealDetails', { mealId, mealSlot: targetSlot });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollContentPaddingBottom + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HealthScreenHeader title="Add Food" onBack={pop} />

        <View style={styles.searchWrap}>
          <Search color={healthTheme.slate} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search foods..."
            placeholderTextColor={healthTheme.muted}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Results</Text>
        {results.length === 0 ? (
          <Text style={styles.empty}>No meals match your search.</Text>
        ) : (
          results.map((meal) => {
            const recipeSteps = getMealInstructions(meal.meal_id).length;
            return (
            <PremiumCard key={meal.meal_id} padding={16}>
              <View style={styles.resultRow}>
                <Pressable
                  onPress={() => handleOpenPreview(meal.meal_id)}
                  style={styles.resultPressable}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${meal.name}`}
                >
                  <View style={styles.resultCopy}>
                    <Text style={styles.resultName}>{meal.name}</Text>
                    <Text style={styles.resultMeta}>
                      {meal.macros.calories} kcal · P{meal.macros.protein} F{meal.macros.fat} C
                      {meal.macros.carbs}
                    </Text>
                    <Text style={styles.serving}>1 serving · {meal.prep_time} min prep</Text>
                    {recipeSteps > 0 ? (
                      <Text style={styles.recipeHint}>
                        {recipeSteps} steps · Tap to view recipe
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight color={healthTheme.muted} size={18} />
                </Pressable>
                <Pressable
                  onPress={() => handleQuickAdd(meal.meal_id)}
                  style={styles.addBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Quick add ${meal.name}`}
                >
                  <Plus color={healthTheme.ink} size={18} strokeWidth={2.5} />
                </Pressable>
              </View>
            </PremiumCard>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
