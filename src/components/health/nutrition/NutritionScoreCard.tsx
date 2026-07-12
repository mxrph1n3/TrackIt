import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useTodayNutrition } from '../../../hooks/useTodayNutrition';
import { PremiumCard } from '../ui/PremiumCard';

const MEAL_TARGET = 5;

function clampPercent(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}

export function NutritionScoreCard() {
  const { dietPlan, consumedMacros: consumed, mealLog } = useTodayNutrition();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    copy: {
      flex: 1,
    },
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 8,
    },
    headline: {
      fontSize: 17,
      fontWeight: '800',
      color: t.ink,
      marginBottom: 8,
    },
    tip: {
      fontSize: 13,
      fontWeight: '500',
      color: t.muted,
      lineHeight: 20,
    },
    ringWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringLabel: {
      position: 'absolute',
      alignItems: 'center',
    },
    score: {
      fontSize: 22,
      fontWeight: '900',
      color: t.ink,
    },
    scoreMax: {
      fontSize: 11,
      fontWeight: '600',
      color: t.slate,
    },
  }));

  const { score, tips } = useMemo(() => {
    const mealCompleted = Object.values(mealLog).filter(Boolean).length;
    const calPct = clampPercent(consumed.calories, dietPlan.calories);
    const proteinPct = clampPercent(consumed.protein, dietPlan.protein_target);
    const fatPct = clampPercent(consumed.fat, dietPlan.fat_target);
    const carbPct = clampPercent(consumed.carbs, dietPlan.carb_target);
    const macroAvg = Math.round((proteinPct + fatPct + carbPct) / 3);
    const mealPct = Math.round((mealCompleted / MEAL_TARGET) * 100);

    const computed = Math.round((calPct * 0.35 + macroAvg * 0.4 + mealPct * 0.25));

    const hints: string[] = [];
    if (proteinPct >= 80) hints.push('Protein goal on track');
    if (calPct >= 70 && calPct <= 105) hints.push('Calories within target range');
    if (mealCompleted >= 3) hints.push(`${mealCompleted} meals logged today`);
    if (hints.length === 0) hints.push('Log meals to improve your score');

    return { score: computed, tips: hints.slice(0, 3) };
  }, [consumed, dietPlan, mealLog]);

  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <PremiumCard>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>Nutrition Score</Text>
          <Text style={styles.headline}>
            {score >= 75 ? 'Good job! Keep going!' : 'Room to improve today'}
          </Text>
          {tips.map((tip) => (
            <Text key={tip} style={styles.tip}>
              · {tip}
            </Text>
          ))}
        </View>
        <View style={styles.ringWrap}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={healthTheme.accentSoft}
              strokeWidth={stroke}
              fill="transparent"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={healthTheme.accent}
              strokeWidth={stroke}
              fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.ringLabel}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.scoreMax}>/ 100</Text>
          </View>
        </View>
      </View>
    </PremiumCard>
  );
}
