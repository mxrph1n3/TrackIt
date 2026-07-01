import { Droplets, UtensilsCrossed } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { usePlannerTheme } from '../../hooks/usePlannerTheme';
import { useWaterDailyTotal } from '../../hooks/useWaterDailyTotal';
import { navigateTab } from '../../navigation/navigationRef';
import { useHealthStore } from '../../stores/useHealthStore';
import { BRAND, SEMANTIC } from '../../theme/designTokens';
import { PlannerPremiumCard } from './PlannerPremiumCard';
import { PlannerSectionHeader } from './PlannerSectionHeader';
import { PLANNER_COPY } from './plannerTheme';

const RING_SIZE = 72;
const STROKE = 7;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PlannerNutritionModule() {
  const { styles: plannerStyles, theme, surfaces } = usePlannerTheme();
  const consumed = useHealthStore((s) => s.consumedMacros);
  const calorieTarget = useHealthStore((s) => s.dietPlan.calories);
  const proteinTarget = useHealthStore((s) => s.dietPlan.protein_target);
  const fatTarget = useHealthStore((s) => s.dietPlan.fat_target);
  const carbsTarget = useHealthStore((s) => s.dietPlan.carb_target);
  const waterTargetLiters = useHealthStore((s) => s.waterTargetLiters);
  const { waterMl } = useWaterDailyTotal();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        },
        ringWrap: {
          width: RING_SIZE,
          height: RING_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ringCenter: {
          ...StyleSheet.absoluteFill,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ringValue: {
          fontSize: 14,
          fontWeight: '900',
          color: theme.textPrimary,
        },
        macros: {
          flex: 1,
          gap: 8,
        },
        macroLine: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        },
        macroLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
        },
        macroValue: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.textPrimary,
        },
        timeline: {
          marginTop: 14,
          gap: 8,
        },
        timelineItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 14,
          backgroundColor: surfaces.inset,
          borderWidth: 1,
          borderColor: surfaces.border,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        timelineText: {
          flex: 1,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textSecondary,
        },
      }),
    [surfaces, theme],
  );

  const calorieProgress = calorieTarget > 0 ? Math.min(1, consumed.calories / calorieTarget) : 0;
  const waterLiters = waterMl / 1000;
  const waterProgress = waterTargetLiters > 0 ? Math.min(1, waterLiters / waterTargetLiters) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - calorieProgress);

  return (
    <Pressable onPress={() => navigateTab('Health')}>
      <PlannerPremiumCard>
        <View style={plannerStyles.moduleInner}>
          <PlannerSectionHeader
            title={PLANNER_COPY.nutrition}
            subtitle={`${consumed.calories} / ${calorieTarget} kcal`}
            actionLabel={PLANNER_COPY.open}
            onAction={() => navigateTab('Health')}
          />

          <View style={styles.row}>
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke="rgba(119, 93, 216, 0.12)"
                  strokeWidth={STROKE}
                  fill="transparent"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={BRAND.primary}
                  strokeWidth={STROKE}
                  fill="transparent"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.ringValue}>{Math.round(calorieProgress * 100)}%</Text>
              </View>
            </View>

            <View style={styles.macros}>
              <MacroLine label="Protein" value={`${consumed.protein} / ${proteinTarget} g`} styles={styles} />
              <MacroLine label="Fat" value={`${consumed.fat} / ${fatTarget} g`} styles={styles} />
              <MacroLine label="Carbs" value={`${consumed.carbs} / ${carbsTarget} g`} styles={styles} />
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <UtensilsCrossed color={BRAND.primary} size={16} />
              <Text style={styles.timelineText}>Meal timeline in Health</Text>
            </View>
            <View style={styles.timelineItem}>
              <Droplets color={SEMANTIC.incomeSoft} size={16} />
              <Text style={styles.timelineText}>
                Water {waterLiters.toFixed(1)} / {waterTargetLiters.toFixed(1)} L ({Math.round(waterProgress * 100)}%)
              </Text>
            </View>
          </View>
        </View>
      </PlannerPremiumCard>
    </Pressable>
  );
}

function MacroLine({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={styles.macroLine}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}
