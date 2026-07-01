import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Check,
  ChevronRight,
  Droplets,
  Dumbbell,
  Play,
  Plus,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, Text, View, ImageBackground, useWindowDimensions, type ImageSourcePropType, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useHealthAssets } from '../../lib/healthAssets';
import { getImageScrim } from '../../lib/themeAssets';
import { navigateTab } from '../../navigation/navigationRef';
import { useWaterDailyTotal } from '../../hooks/useWaterDailyTotal';
import { useDashboardHealthStyles, type DashboardHealthStyles } from '../../hooks/useDashboardHealthStyles';
import { useDashboardWorkoutSnapshot } from '../../hooks/useDashboardWorkoutSnapshot';
import { insertWaterLog } from '../../lib/quickActions/service';
import { formatNextWorkoutWhen } from '../../lib/health/workoutDashboard';
import { countCompletedExercises } from '../../lib/health/workoutEngine';
import { useCreateHubStore } from '../../stores/useCreateHubStore';
import { useHealthStore } from '../../stores/useHealthStore';
import { MEAL_SLOT_ORDER } from '../../constants/mealSlots';
import { SLOT_LABELS } from '../../constants/meals';
import { BRAND, SEMANTIC } from '../../theme/designTokens';
import { timingProgress } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';
import type { MacroTotals, MealSlot } from '../../types/health';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GLASS_ML = 250;

const MEAL_SLOTS = MEAL_SLOT_ORDER.map((id) => ({
  id,
  label: SLOT_LABELS[id] ?? id,
}));

function formatActiveElapsed(
  startedAtMs: number,
  totalPausedMs: number,
  isPaused: boolean,
  pausedAtMs: number | null,
): string {
  let elapsedMs = Date.now() - startedAtMs - totalPausedMs;
  if (isPaused && pausedAtMs) {
    elapsedMs -= Date.now() - pausedAtMs;
  }
  const totalSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function HealthImageHalf({
  imageSource,
  panelHeight,
  dense,
  showBackgroundImage = true,
  scrimColors,
  plainColors,
  styles,
  children,
}: {
  imageSource: ImageSourcePropType;
  panelHeight: number;
  dense?: boolean;
  showBackgroundImage?: boolean;
  scrimColors: readonly [string, string, ...string[]];
  plainColors: readonly [string, string];
  styles: DashboardHealthStyles;
  children: ReactNode;
}) {
  const content = (
    <LinearGradient
      colors={
        showBackgroundImage
          ? [...scrimColors]
          : [...plainColors]
      }
      locations={showBackgroundImage ? [0, 0.35, 0.62, 1] : [0, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.imageHalfContent, dense ? styles.imageHalfContentDense : null]}
    >
      {children}
    </LinearGradient>
  );

  if (!showBackgroundImage) {
    return (
      <View
        style={[
          styles.imageHalf,
          styles.imageHalfPlain,
          { height: panelHeight, backgroundColor: plainColors[0], borderTopColor: plainColors[0] },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <ImageBackground
      source={imageSource}
      style={[styles.imageHalf, { height: panelHeight }]}
      imageStyle={styles.imageHalfArt}
      resizeMode="cover"
    >
      {content}
    </ImageBackground>
  );
}

function ProgressRing({
  percent,
  size = 54,
  styles,
}: {
  percent: number;
  size?: number;
  styles: DashboardHealthStyles;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, percent)), timingProgress());
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value / 100),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(119, 93, 216, 0.12)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={BRAND.primary}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={styles.ringLabel}>{Math.round(percent)}%</Text>
    </View>
  );
}

function HealthHeader({
  onOpenHealth,
  styles,
}: {
  onOpenHealth: () => void;
  styles: DashboardHealthStyles;
}) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-row items-center gap-2.5">
        <View style={styles.headerIconShell}>
          <View className="flex-row items-center gap-0.5">
            <Dumbbell color={BRAND.primary} size={14} strokeWidth={2.1} />
            <UtensilsCrossed color={BRAND.primaryLight} size={13} strokeWidth={2.1} />
          </View>
        </View>
        <View>
          <Text style={styles.headerTitle}>Health</Text>
          <Text style={styles.headerSubtitle}>Today</Text>
        </View>
      </View>
      <Pressable onPress={onOpenHealth} style={styles.openButton} className="active:opacity-85">
        <ChevronRight color={BRAND.primary} size={18} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function NutritionHeader({
  onOpenHealth,
  styles,
}: {
  onOpenHealth: () => void;
  styles: DashboardHealthStyles;
}) {
  return (
    <View style={styles.nutritionHeader}>
      <View style={styles.nutritionHeaderLeft}>
        <View style={styles.nutritionIconShell}>
          <UtensilsCrossed color={BRAND.primary} size={16} strokeWidth={2.1} />
        </View>
        <View>
          <Text style={styles.nutritionTitle}>Nutrition</Text>
          <Text style={styles.nutritionSubtitle}>Today&apos;s fuel</Text>
        </View>
      </View>
      <Pressable onPress={onOpenHealth} style={styles.openButton} className="active:opacity-85">
        <ChevronRight color={BRAND.primary} size={18} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

type NutritionDashboardSectionProps = {
  calories: number;
  calorieTarget: number;
  caloriePercent: number;
  nutritionGoalReached: boolean;
  consumed: MacroTotals;
  macroTargets: { protein: number; fat: number; carbs: number };
  waterLiters: number;
  waterTargetL: number;
  mealLog: ReturnType<typeof useHealthStore.getState>['mealLog'];
  quickMeals: ReturnType<typeof useHealthStore.getState>['quickMeals'];
  onOpenHealth: () => void;
  onAddWater: () => void;
  onAddMeal: () => void;
  calorieBarStyle: AnimatedStyle<ViewStyle>;
};

function NutritionDashboardSection({
  calories,
  calorieTarget,
  caloriePercent,
  nutritionGoalReached,
  consumed,
  macroTargets,
  waterLiters,
  waterTargetL,
  mealLog,
  quickMeals,
  onOpenHealth,
  onAddWater,
  onAddMeal,
  calorieBarStyle,
  styles,
}: NutritionDashboardSectionProps & { styles: DashboardHealthStyles }) {
  const { theme } = useTheme();
  const waterPercent = Math.min(100, Math.round((waterLiters / waterTargetL) * 100));

  const macros = [
    { key: 'P', value: consumed.protein, target: macroTargets.protein, color: '#6366F1' },
    { key: 'F', value: consumed.fat, target: macroTargets.fat, color: '#F59E0B' },
    { key: 'C', value: consumed.carbs, target: macroTargets.carbs, color: '#34D399' },
  ] as const;

  return (
    <View style={[styles.nutritionPanel, { backgroundColor: theme.cardFrosted, borderTopColor: theme.borderSubtle }]}>
      <NutritionHeader onOpenHealth={onOpenHealth} styles={styles} />

      <Pressable onPress={onOpenHealth} style={styles.calorieHero} className="active:opacity-94">
        <View style={styles.calorieHeroText}>
          {nutritionGoalReached ? (
            <View style={styles.goalBadgeRow}>
              <Sparkles color={SEMANTIC.income} size={14} />
              <Text style={styles.goalBadgeText}>Daily goal hit</Text>
            </View>
          ) : null}
          <Text style={styles.calorieHeroValue}>{calories.toLocaleString('en-US')}</Text>
          <Text style={styles.calorieHeroTarget}>
            of {calorieTarget.toLocaleString('en-US')} kcal
          </Text>
        </View>
        <ProgressRing percent={caloriePercent} size={56} styles={styles} />
      </Pressable>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            calorieBarStyle,
            { backgroundColor: nutritionGoalReached ? SEMANTIC.income : BRAND.primary },
          ]}
        />
      </View>

      <View style={styles.macroRow}>
        {macros.map((macro) => {
          const percent =
            macro.target > 0 ? Math.min(100, Math.round((macro.value / macro.target) * 100)) : 0;
          return (
            <View key={macro.key} style={styles.macroChip}>
              <Text style={styles.macroChipLabel}>{macro.key}</Text>
              <Text style={styles.macroChipValue}>{Math.round(macro.value)}g</Text>
              <View style={styles.macroChipTrack}>
                <View
                  style={[
                    styles.macroChipFill,
                    { width: `${percent}%`, backgroundColor: macro.color },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.waterCard}>
        <View style={styles.waterTopRow}>
          <View style={styles.waterLabelRow}>
            <Droplets color={BRAND.primary} size={15} strokeWidth={2} />
            <Text style={styles.waterText}>
              {waterLiters.toFixed(1)} / {waterTargetL.toFixed(1)} L
            </Text>
          </View>
          <Pressable onPress={onAddWater} style={styles.glassButton} className="active:opacity-85">
            <Plus color={BRAND.primary} size={14} strokeWidth={2.4} />
            <Text style={styles.glassButtonText}>+250 ml</Text>
          </Pressable>
        </View>
        <View style={styles.waterTrack}>
          <View style={[styles.waterFill, { width: `${waterPercent}%` }]} />
        </View>
      </View>

      <View style={styles.mealSlotRow}>
        {MEAL_SLOTS.map((slot) => {
          const logged = Boolean(mealLog[slot.id]) || Boolean(quickMeals[slot.id]);
          return (
            <View
              key={slot.id}
              style={[styles.mealSlot, logged ? styles.mealSlotLogged : styles.mealSlotPending]}
            >
              <Text style={[styles.mealSlotLetter, logged ? styles.mealSlotLetterLogged : null]}>
                {slot.label.slice(0, 1)}
              </Text>
              <Text style={styles.mealSlotName} numberOfLines={1}>
                {slot.label}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable onPress={onAddMeal} style={styles.addMealButton} className="active:opacity-90">
        <Plus color={BRAND.primary} size={15} strokeWidth={2.5} />
        <Text style={styles.addMealText}>Log meal</Text>
      </Pressable>
    </View>
  );
}

export function DashboardHealthCard() {
  const consumed = useHealthStore((s) => s.consumedMacros);
  const dietPlan = useHealthStore((s) => s.dietPlan);
  const activeSession = useHealthStore((s) => s.activeSession);
  const openWorkoutGoalPicker = useHealthStore((s) => s.openWorkoutGoalPicker);
  const lastSession = useHealthStore((s) => s.lastSession);
  const waterTargetLiters = useHealthStore((s) => s.waterTargetLiters);
  const mealLog = useHealthStore((s) => s.mealLog);
  const quickMeals = useHealthStore((s) => s.quickMeals);
  const openHub = useCreateHubStore((s) => s.open);
  const workoutSnapshot = useDashboardWorkoutSnapshot();
  const calorieTarget = dietPlan.calories;
  const macroTargets = {
    protein: dietPlan.protein_target,
    fat: dietPlan.fat_target,
    carbs: dietPlan.carb_target,
  };

  const [elapsedLabel, setElapsedLabel] = useState('00:00:00');
  const { waterMl, addWaterOptimistic } = useWaterDailyTotal();
  const [isAddingWater, setIsAddingWater] = useState(false);

  const isActive = Boolean(activeSession && !activeSession.completionSummary);
  const completedToday =
    !isActive &&
    (lastSession.relativeDay === 'Today' || Boolean(activeSession?.completionSummary));
  const completionSummary = activeSession?.completionSummary ?? null;
  const isRestDay = workoutSnapshot.isRestDay;

  const workoutProgress = useMemo(() => {
    if (!activeSession || activeSession.completionSummary) return 0;
    const done = countCompletedExercises(activeSession.exercises);
    const total = activeSession.exercises.length || 1;
    return Math.round((done / total) * 100);
  }, [activeSession]);

  const nextWorkoutMeta = useMemo(() => {
    const next = workoutSnapshot.nextTraining;
    if (!next) return 'Recovery day';
    return `Next · ${next.day.split} · ${formatNextWorkoutWhen(next.stepsAhead, next.day.dayLabel)}`;
  }, [workoutSnapshot.nextTraining]);

  const scheduledWorkoutMeta = useMemo(() => {
    const xpSuffix =
      workoutSnapshot.todayPlan.xpReward > 0
        ? ` · +${workoutSnapshot.todayPlan.xpReward} XP`
        : '';
    return `${workoutSnapshot.exerciseCount} exercises · ≈${workoutSnapshot.estimatedMinutes} min${xpSuffix}`;
  }, [
    workoutSnapshot.estimatedMinutes,
    workoutSnapshot.exerciseCount,
    workoutSnapshot.todayPlan.xpReward,
  ]);

  const calories = consumed.calories;
  const caloriePercent = Math.min(100, Math.round((calories / calorieTarget) * 100));
  const nutritionGoalReached = caloriePercent >= 100;
  const waterLiters = waterMl / 1000;
  const waterTargetL = waterTargetLiters > 0 ? waterTargetLiters : 3;

  const calorieProgress = useSharedValue(0);

  useEffect(() => {
    calorieProgress.value = withTiming(caloriePercent, timingProgress());
  }, [caloriePercent, calorieProgress]);

  useEffect(() => {
    if (!isActive || !activeSession) return;
    const tick = () => {
      setElapsedLabel(
        formatActiveElapsed(
          activeSession.startedAtMs,
          activeSession.totalPausedMs,
          activeSession.isPaused,
          activeSession.pausedAtMs,
        ),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeSession, isActive]);

  const calorieBarStyle = useAnimatedStyle(() => ({
    width: `${calorieProgress.value}%`,
  }));

  const handleOpenHealth = useCallback(() => {
    navigateTab('Health');
  }, []);

  const handleStartWorkout = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openWorkoutGoalPicker();
  }, [openWorkoutGoalPicker]);

  const handleContinueWorkout = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleAddWater = useCallback(async () => {
    if (isAddingWater) return;
    setIsAddingWater(true);
    try {
      await insertWaterLog({ amountMl: GLASS_ML });
      addWaterOptimistic(GLASS_ML);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      addWaterOptimistic(GLASS_ML);
    } finally {
      setIsAddingWater(false);
    }
  }, [addWaterOptimistic, isAddingWater]);

  const streakLine = workoutSnapshot.weekProgressLine;

  const { width: screenWidth } = useWindowDimensions();
  const { mode, theme } = useTheme();
  const { styles } = useDashboardHealthStyles();
  const { todayWidget } = useHealthAssets();
  const panelHeight = Math.round((screenWidth - 32) * 0.5);
  const imageScrim = getImageScrim(mode, 'horizontal');
  const plainPanelColors = [theme.cardFrosted, theme.cardFrosted] as const;

  return (
    <View style={styles.cardShell}>
      <View style={styles.cardInner}>
        <HealthImageHalf
          imageSource={todayWidget}
          panelHeight={panelHeight}
          scrimColors={imageScrim}
          plainColors={plainPanelColors}
          styles={styles}
        >
          <HealthHeader onOpenHealth={handleOpenHealth} styles={styles} />

          <Pressable onPress={handleOpenHealth} className="mt-3 active:opacity-94">
            {isActive && activeSession ? (
              <View>
                <Text style={styles.activeKicker}>Workout active</Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text style={styles.workoutTitle}>{activeSession.focusName}</Text>
                    <Text style={styles.timerValue}>{elapsedLabel}</Text>
                  </View>
                  <ProgressRing percent={workoutProgress} styles={styles} />
                </View>
              </View>
            ) : completedToday ? (
              <View>
                <View className="flex-row items-center gap-2">
                  <Check color={SEMANTIC.income} size={18} strokeWidth={2.8} />
                  <Text style={styles.completedTitle}>
                    {completionSummary?.focusName ?? lastSession.title} complete
                  </Text>
                </View>
                <Text style={styles.completedMeta}>
                  {completionSummary?.durationMinutes ?? lastSession.durationMinutes} min
                  {(completionSummary?.xpEarned ?? lastSession.xpEarned) > 0
                    ? ` · +${completionSummary?.xpEarned ?? lastSession.xpEarned} XP`
                    : ''}
                  {completionSummary?.tonnageKg
                    ? ` · ${completionSummary.tonnageKg.toLocaleString('en-US')} kg`
                    : ''}
                </Text>
              </View>
            ) : isRestDay ? (
              <View>
                <Text style={styles.workoutTitle}>{workoutSnapshot.todayPlan.split}</Text>
                <Text style={styles.workoutMeta}>{workoutSnapshot.muscleGroups}</Text>
                <Text style={styles.workoutMeta}>{nextWorkoutMeta}</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text style={styles.workoutTitle}>{workoutSnapshot.focusName}</Text>
                  <Text style={styles.workoutMeta}>{workoutSnapshot.muscleGroups}</Text>
                  <Text style={styles.workoutMeta}>{scheduledWorkoutMeta}</Text>
                </View>
                <ProgressRing percent={0} styles={styles} />
              </View>
            )}
          </Pressable>

          <Pressable
            onPress={
              isActive
                ? handleContinueWorkout
                : completedToday
                  ? handleOpenHealth
                  : isRestDay
                    ? handleOpenHealth
                    : handleStartWorkout
            }
            className="mt-3 active:opacity-90"
            style={styles.primaryButton}
          >
            <View className="flex-row items-center justify-center gap-2">
              {!isActive && !completedToday && !isRestDay ? (
                <Play color={theme.textPrimary} size={15} fill={theme.textPrimary} />
              ) : null}
              <Text style={styles.primaryButtonText}>
                {isActive
                  ? 'Continue workout'
                  : completedToday
                    ? 'View report'
                    : isRestDay
                      ? 'View program'
                      : 'Start workout'}
              </Text>
            </View>
          </Pressable>

          <Text style={styles.footerMeta}>{streakLine}</Text>
        </HealthImageHalf>

        <NutritionDashboardSection
          calories={calories}
          calorieTarget={calorieTarget}
          caloriePercent={caloriePercent}
          nutritionGoalReached={nutritionGoalReached}
          consumed={consumed}
          macroTargets={macroTargets}
          waterLiters={waterLiters}
          waterTargetL={waterTargetL}
          mealLog={mealLog}
          quickMeals={quickMeals}
          onOpenHealth={handleOpenHealth}
          onAddWater={() => void handleAddWater()}
          onAddMeal={() => openHub('meal')}
          calorieBarStyle={calorieBarStyle}
          styles={styles}
        />
      </View>
    </View>
  );
}
