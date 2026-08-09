import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { CaloriesHeroCard } from './nutrition/CaloriesHeroCard';
import { MacroCardsRow } from './nutrition/MacroCardsRow';
import { MealsTimeline, NextMealCard } from './nutrition/MealsTimeline';
import { NutritionScoreCard } from './nutrition/NutritionScoreCard';
import { WaterTrackerCard } from './nutrition/WaterTrackerCard';
import { HealthPrimaryButton } from './ui/HealthPrimaryButton';

export function NutritionTabPanel() {
  const { t } = useTranslation();
  const { push } = useHealthNavigation();

  return (
    <View>
      <CaloriesHeroCard />
      <MacroCardsRow />
      <WaterTrackerCard />
      <MealsTimeline />
      <NextMealCard />
      <NutritionScoreCard />
      <HealthPrimaryButton label={t('nutrition.addMeal')} onPress={() => push('FoodSearch')} />
    </View>
  );
}
