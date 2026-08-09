import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { tMealName } from '../../i18n/helpers';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import type { HealthStackParamList } from '../../navigation/healthTypes';
import { useHealthStore } from '../../stores/useHealthStore';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { PremiumCard } from '../../components/health/ui/PremiumCard';

const CATEGORY_KEYS = ['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

export function FoodSearchScreen() {
  const { t } = useTranslation();
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const route = useRoute<RouteProp<HealthStackParamList, 'FoodSearch'>>();
  const { pop, push } = useHealthNavigation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryKey>('all');
  const swapMeal = useHealthStore((s) => s.swapMeal);
  const { mealLog, quickMeals } = useTodayNutrition();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((ht) => ({
    root: { flex: 1, backgroundColor: ht.background },
    content: { paddingHorizontal: 20 },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: ht.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ht.cardBorder,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 14,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: ht.ink,
      fontWeight: '500',
    },
    chips: { gap: 8, marginBottom: 16 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: ht.card,
      borderWidth: 1,
      borderColor: ht.cardBorder,
    },
    chipActive: {
      backgroundColor: ht.accent,
      borderColor: ht.accent,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: ht.slate,
    },
    chipTextActive: {
      color: ht.ink,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
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
      color: ht.ink,
    },
    resultMeta: {
      marginTop: 4,
      fontSize: 13,
      color: ht.slate,
    },
    serving: {
      marginTop: 2,
      fontSize: 12,
      color: ht.muted,
    },
    recipeHint: {
      marginTop: 6,
      fontSize: 12,
      fontWeight: '600',
      color: ht.accent,
    },
    addBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: ht.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    empty: {
      textAlign: 'center',
      color: ht.slate,
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
      const localizedName = tMealName(t, meal.meal_id, meal.name).toLowerCase();
      const matchesQuery =
        !q || meal.name.toLowerCase().includes(q) || localizedName.includes(q);
      const matchesCategory = category === 'all' || meal.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category, t]);

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
        <HealthScreenHeader title={t('nutrition.addFood')} onBack={pop} />

        <View style={styles.searchWrap}>
          <Search color={healthTheme.slate} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('nutrition.searchFoods')}
            placeholderTextColor={healthTheme.muted}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORY_KEYS.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t(`nutrition.mealTypes.${item}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>{t('nutrition.results')}</Text>
        {results.length === 0 ? (
          <Text style={styles.empty}>{t('nutrition.noMealsMatch')}</Text>
        ) : (
          results.map((meal) => {
            const recipeSteps = getMealInstructions(meal.meal_id).length;
            const localizedName = tMealName(t, meal.meal_id, meal.name);
            return (
            <PremiumCard key={meal.meal_id} padding={16}>
              <View style={styles.resultRow}>
                <Pressable
                  onPress={() => handleOpenPreview(meal.meal_id)}
                  style={styles.resultPressable}
                  accessibilityRole="button"
                  accessibilityLabel={t('nutrition.viewMealA11y', { name: localizedName })}
                >
                  <View style={styles.resultCopy}>
                    <Text style={styles.resultName}>{localizedName}</Text>
                    <Text style={styles.resultMeta}>
                      {meal.macros.calories} {t('common.kcal')} · P{meal.macros.protein} F{meal.macros.fat}{' '}
                      C{meal.macros.carbs}
                    </Text>
                    <Text style={styles.serving}>
                      {t('nutrition.servingPrep', { minutes: meal.prep_time })}
                    </Text>
                    {recipeSteps > 0 ? (
                      <Text style={styles.recipeHint}>
                        {t('nutrition.recipeStepsHint', { count: recipeSteps })}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRight color={healthTheme.muted} size={18} />
                </Pressable>
                <Pressable
                  onPress={() => handleQuickAdd(meal.meal_id)}
                  style={styles.addBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t('nutrition.quickAddA11y', { name: localizedName })}
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
