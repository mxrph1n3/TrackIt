import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useMemo } from 'react';

import { getMealById, getMealInstructions } from '../../constants/meals';
import { resolveMealSlot } from '../../constants/mealSlots';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { useTodayNutrition } from '../../hooks/useTodayNutrition';
import { tMealName } from '../../i18n/helpers';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import type { HealthStackParamList } from '../../navigation/healthTypes';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { PremiumCard } from '../../components/health/ui/PremiumCard';
import { useHealthStore } from '../../stores/useHealthStore';

const SLOT_TYPE_KEYS: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'eveningSnack'> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'snacks',
  evening_snack: 'eveningSnack',
};

export function MealDetailsScreen() {
  const { t } = useTranslation();
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const { pop } = useHealthNavigation();
  const route = useRoute<RouteProp<HealthStackParamList, 'MealDetails'>>();
  const mealSlot = route.params?.mealSlot;
  const previewMealId = route.params?.mealId;
  const { mealLog, quickMeals } = useTodayNutrition();
  const swapMeal = useHealthStore((s) => s.swapMeal);
  const healthTheme = useHealthTheme();

  const loggedMealId = mealSlot ? mealLog[mealSlot] : undefined;
  const mealId = previewMealId ?? loggedMealId;
  const meal = mealId ? getMealById(mealId) : null;
  const isPreview = Boolean(previewMealId);
  const instructions = meal ? getMealInstructions(meal.meal_id) : [];

  const styles = useHealthStyles((ht) => ({
    root: { flex: 1, backgroundColor: ht.background },
    content: { paddingHorizontal: 20 },
    empty: { color: ht.slate, textAlign: 'center', marginTop: 24 },
    mealName: {
      fontSize: 28,
      fontWeight: '900',
      color: ht.ink,
      letterSpacing: -0.4,
    },
    calories: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '700',
      color: ht.accent,
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
      color: ht.slate,
      marginTop: 20,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
      marginBottom: 12,
    },
    ingredient: {
      fontSize: 15,
      color: ht.ink,
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
      backgroundColor: ht.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    stepNumberText: {
      fontSize: 13,
      fontWeight: '800',
      color: ht.accent,
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: ht.ink,
    },
    addHeaderBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: ht.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const headerTitle = useMemo(() => {
    if (isPreview) {
      return t('nutrition.meal');
    }
    if (mealSlot && SLOT_TYPE_KEYS[mealSlot]) {
      return t(`nutrition.mealTypes.${SLOT_TYPE_KEYS[mealSlot]}`);
    }
    return t('nutrition.meal');
  }, [isPreview, mealSlot, t]);

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
        <HealthScreenHeader title={t('nutrition.meal')} onBack={pop} />
        <Text style={styles.empty}>{t('health.mealNotFound')}</Text>
      </View>
    );
  }

  const localizedName = tMealName(t, meal.meal_id, meal.name);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollContentPaddingBottom + 16 }]}
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
                accessibilityLabel={t('nutrition.addMealA11y', { name: localizedName })}
              >
                <Plus color={healthTheme.ink} size={18} strokeWidth={2.5} />
              </Pressable>
            ) : undefined
          }
        />

        <Text style={styles.mealName}>{localizedName}</Text>
        <Text style={styles.calories}>
          {meal.macros.calories} {t('common.kcal')}
        </Text>

        <PremiumCard>
          <View style={styles.macroRow}>
            <MacroPill label={t('common.protein')} value={`${meal.macros.protein}g`} />
            <MacroPill label={t('common.fat')} value={`${meal.macros.fat}g`} />
            <MacroPill label={t('common.carbs')} value={`${meal.macros.carbs}g`} />
          </View>
        </PremiumCard>

        <Text style={styles.sectionTitle}>{t('nutrition.howToPrepare')}</Text>
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

        <Text style={styles.sectionTitle}>{t('nutrition.ingredients')}</Text>
        <PremiumCard>
          {meal.ingredients.map((ing) => (
            <Text key={ing.id} style={styles.ingredient}>
              · {ing.id.replace(/_/g, ' ')} — {ing.grams}g
            </Text>
          ))}
        </PremiumCard>

        <Text style={styles.sectionTitle}>{t('nutrition.details')}</Text>
        <PremiumCard>
          <Text style={styles.sectionKicker}>{t('nutrition.nutritionFacts')}</Text>
          <FactRow label={t('nutrition.prepTime')} value={`${meal.prep_time} min`} />
          <FactRow label={t('nutrition.cuisine')} value={meal.cuisine} />
          <FactRow label={t('nutrition.tier')} value={meal.tier} />
          <FactRow label={t('nutrition.category')} value={meal.category} />
        </PremiumCard>
      </ScrollView>
    </View>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  const styles = useHealthStyles((ht) => ({
    pill: {
      flex: 1,
      backgroundColor: ht.accentSoft,
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
    },
    pillLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: ht.slate,
    },
    pillValue: {
      marginTop: 2,
      fontSize: 15,
      fontWeight: '800',
      color: ht.ink,
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
  const styles = useHealthStyles((ht) => ({
    factRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: ht.cardBorder,
    },
    factLabel: { color: ht.slate, fontSize: 14 },
    factValue: { color: ht.ink, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  }));

  return (
    <View style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}
