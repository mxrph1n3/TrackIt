/**
 * Health Hub Zustand store — training session + nutrition logs.
 */
import { create } from 'zustand';

import {
  getDefaultDayIndex,
  getProgramDay,
  getWorkoutTrack,
  listDaysForWeek,
} from '../constants/workoutPrograms';
import { buildWeeklyPlan } from '../lib/health/workoutDashboard';
import { upsertWorkoutSessionComplete } from '../lib/dashboard/metricsService';
import { processWorkoutPersonalRecords } from '../lib/health/exercisePrService';
import { persistTodayNutrition, sumNutritionCalories, type NutritionDaySnapshot } from '../lib/health/nutritionService';
import { buildDefaultDietPlan, buildNutritionTargets, type NutritionTargets } from '../lib/health/nutritionTargets';
import { fetchWorkoutLifetimeStats, mergeLifetimeStats } from '../lib/health/workoutStatsService';
import { reportSyncSuccess } from '../lib/sync/reportSyncError';
import { useMetricsSyncStore } from './useMetricsSyncStore';
import { fetchLatestWeight } from '../lib/health/weightService';
import {
  buildExercisesFromDay,
  computeSessionStats,
  computeWorkoutXp,
  countCompletedExercises,
  estimateDayDurationMinutes,
  findNextIncompleteExerciseIndex,
  isExerciseComplete,
  markExercisesCompleteThroughIndex,
  sessionDurationMinutes,
} from '../lib/health/workoutEngine';
import { getMealById } from '../constants/meals';
import { toDayKey } from '../utils/plannerDates';
import { useGamificationStore } from './useGamificationStore';
import type {
  ActiveWorkoutSession,
  BodyStats,
  DailyMealLog,
  DayPlan,
  DietPlan,
  EnergyLevel,
  LastWorkoutSession,
  MacroTotals,
  MealSlot,
  QuickMealLog,
  WorkoutCompletionSummary,
  WorkoutLifetimeStats,
} from '../types/health';
import type { WorkoutTrackId } from '../types/workout';

const EMPTY_MEAL_LOG: DailyMealLog = {
  breakfast: null,
  lunch: null,
  dinner: null,
  snack: null,
  evening_snack: null,
};

const DEFAULT_DIET_PLAN = buildDefaultDietPlan();
const DEFAULT_WATER_TARGET_L = buildNutritionTargets().waterTargetMl / 1000;

function sumMacrosFromLog(mealLog: DailyMealLog, quickMeals: QuickMealLog = {}): MacroTotals {
  const base = Object.values(mealLog).reduce(
    (acc, mealId) => {
      if (!mealId) return acc;
      const meal = getMealById(mealId);
      if (!meal) return acc;
      return {
        calories: acc.calories + meal.macros.calories,
        protein: acc.protein + meal.macros.protein,
        fat: acc.fat + meal.macros.fat,
        carbs: acc.carbs + meal.macros.carbs,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  for (const entry of Object.values(quickMeals)) {
    if (!entry) continue;
    base.calories += entry.calories;
  }

  return base;
}

function emptyNutritionFields(calorieTarget: number) {
  const consumedMacros = sumMacrosFromLog(EMPTY_MEAL_LOG);
  return {
    mealLog: { ...EMPTY_MEAL_LOG },
    quickMeals: {} as QuickMealLog,
    consumedMacros,
    remainingCalories: calorieTarget,
  };
}

function resolveCurrentDay(trackId: WorkoutTrackId, weekNumber: number, dayIndex: number) {
  const days = listDaysForWeek(trackId, weekNumber);
  const safeIndex = ((dayIndex % days.length) + days.length) % days.length;
  return days[safeIndex];
}

type HealthState = {
  selectedTrackId: WorkoutTrackId;
  selectedWeek: number;
  selectedDayIndex: number;
  domsBannerDismissed: boolean;
  weeklyPlan: DayPlan[];
  todayWorkoutTitle: string;
  todayFocusName: string;
  todayExerciseCount: number;
  todayEstimatedMinutes: number;
  bodyStats: BodyStats;
  fatiguePercent: number;
  energyLevel: EnergyLevel;
  lifetimeStats: WorkoutLifetimeStats;
  lastSession: LastWorkoutSession;
  activeSession: ActiveWorkoutSession | null;
  isWorkoutGoalPickerOpen: boolean;
  dietPlan: DietPlan;
  mealLog: DailyMealLog;
  quickMeals: QuickMealLog;
  consumedMacros: MacroTotals;
  remainingCalories: number;
  waterTargetLiters: number;
  nutritionDayKey: string | null;
  swapTarget: { slot: MealSlot; mealId: string } | null;
  rpgStrengthXp: number;
  rpgEnduranceXp: number;

  setTrack: (trackId: WorkoutTrackId) => void;
  setWeek: (week: number) => void;
  selectDay: (index: number) => void;
  delayWorkoutDay: () => void;
  dismissDomsBanner: () => void;
  openWorkoutGoalPicker: () => void;
  closeWorkoutGoalPicker: () => void;
  beginWorkoutWithTrack: (trackId: WorkoutTrackId) => void;
  startWorkout: () => void;
  cancelWorkout: () => void;
  finishWorkout: () => Promise<WorkoutCompletionSummary | null>;
  dismissWorkoutCompletion: () => void;
  advanceExerciseOrFinish: () => Promise<WorkoutCompletionSummary | null>;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  selectExercise: (index: number) => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  adjustSetWeight: (exerciseId: string, setId: string, delta: number) => void;
  adjustSetReps: (exerciseId: string, setId: string, delta: number) => void;
  togglePause: () => void;
  swapMeal: (slot: MealSlot, newMealId: string) => void;
  logQuickMeal: (slot: MealSlot, name: string, calories: number) => void;
  resetDailyNutrition: (dayKey: string) => void;
  hydrateNutrition: (snapshot: NutritionDaySnapshot, dayKey?: string) => void;
  applyNutritionTargets: (targets: NutritionTargets) => void;
  openSwapPicker: (slot: MealSlot, mealId: string) => void;
  closeSwapPicker: () => void;
  getSwapOptions: (mealId: string) => string[];
};

function syncDayContext(
  trackId: WorkoutTrackId,
  weekNumber: number,
  dayIndex: number,
): Pick<
  HealthState,
  'weeklyPlan' | 'todayWorkoutTitle' | 'todayFocusName' | 'todayExerciseCount' | 'todayEstimatedMinutes'
> {
  const track = getWorkoutTrack(trackId);
  const day = resolveCurrentDay(trackId, weekNumber, dayIndex);
  return {
    weeklyPlan: buildWeeklyPlan(trackId, weekNumber, dayIndex),
    todayWorkoutTitle: track.title,
    todayFocusName: day.focusName,
    todayExerciseCount: day.exercises.length,
    todayEstimatedMinutes: estimateDayDurationMinutes(day.exercises.length),
  };
}

function buildAchievements(
  stats: ReturnType<typeof computeSessionStats>,
  durationMinutes: number,
  streakDays: number,
): string[] {
  const unlocked: string[] = [];
  if (stats.tonnageKg >= 10_000) unlocked.push('10,000+ kg volume');
  if (durationMinutes >= 45) unlocked.push('45+ min workout');
  if (stats.completedSetCount >= 50) unlocked.push('50+ sets');
  if (streakDays >= 10) unlocked.push('10-day streak');
  return unlocked;
}

export const useHealthStore = create<HealthState>((set, get) => {
  const initialTrack: WorkoutTrackId = 'maintenance';
  const initialWeek = 1;
  const initialDayIndex = getDefaultDayIndex(initialTrack, initialWeek);

  return {
    selectedTrackId: initialTrack,
    selectedWeek: initialWeek,
    selectedDayIndex: initialDayIndex,
    domsBannerDismissed: false,
    ...syncDayContext(initialTrack, initialWeek, initialDayIndex),
    bodyStats: { weightKg: 78.2, progressPercent: 3 },
    fatiguePercent: 65,
    energyLevel: 'high',
    lifetimeStats: {
      totalWorkouts: 0,
      streakDays: 0,
      longestStreakDays: 0,
      totalMinutes: 0,
      totalTonnageKg: 0,
      personalRecordCount: 0,
    },
    lastSession: {
      title: '—',
      relativeDay: '—',
      durationMinutes: 0,
      xpEarned: 0,
      exerciseCount: 0,
      setCount: 0,
      tonnageKg: 0,
    },
    activeSession: null,
    isWorkoutGoalPickerOpen: false,
    dietPlan: DEFAULT_DIET_PLAN,
    mealLog: EMPTY_MEAL_LOG,
    quickMeals: {},
    consumedMacros: sumMacrosFromLog(EMPTY_MEAL_LOG),
    remainingCalories: DEFAULT_DIET_PLAN.calories,
    waterTargetLiters: DEFAULT_WATER_TARGET_L,
    nutritionDayKey: null,
    swapTarget: null,
    rpgStrengthXp: 1240,
    rpgEnduranceXp: 890,

    setTrack: (trackId) => {
      const week = 1;
      const dayIndex = getDefaultDayIndex(trackId, week);
      set({
        selectedTrackId: trackId,
        selectedWeek: week,
        selectedDayIndex: dayIndex,
        domsBannerDismissed: false,
        ...syncDayContext(trackId, week, dayIndex),
      });
    },

    setWeek: (week) => {
      const { selectedTrackId } = get();
      const dayIndex = getDefaultDayIndex(selectedTrackId, week);
      set({
        selectedWeek: week,
        selectedDayIndex: dayIndex,
        ...syncDayContext(selectedTrackId, week, dayIndex),
      });
    },

    selectDay: (index) => {
      const { selectedTrackId, selectedWeek } = get();
      set({
        selectedDayIndex: index,
        ...syncDayContext(selectedTrackId, selectedWeek, index),
      });
    },

    delayWorkoutDay: () => {
      const { selectedTrackId, selectedWeek, selectedDayIndex } = get();
      const days = listDaysForWeek(selectedTrackId, selectedWeek);
      const nextIndex = (selectedDayIndex + 1) % days.length;
      set({
        selectedDayIndex: nextIndex,
        domsBannerDismissed: true,
        ...syncDayContext(selectedTrackId, selectedWeek, nextIndex),
      });
    },

    dismissDomsBanner: () => set({ domsBannerDismissed: true }),

    openWorkoutGoalPicker: () => {
      const { activeSession } = get();
      if (activeSession && !activeSession.completionSummary) {
        return;
      }
      set({
        activeSession: activeSession?.completionSummary ? null : activeSession,
        isWorkoutGoalPickerOpen: true,
      });
    },

    closeWorkoutGoalPicker: () => set({ isWorkoutGoalPickerOpen: false }),

    beginWorkoutWithTrack: (trackId) => {
      const week = get().selectedWeek;
      const dayIndex = getDefaultDayIndex(trackId, week);
      const day = resolveCurrentDay(trackId, week, dayIndex);
      const exercises = buildExercisesFromDay(day.exercises);
      const dayContext = syncDayContext(trackId, week, dayIndex);

      set({
        selectedTrackId: trackId,
        selectedDayIndex: dayIndex,
        ...dayContext,
        isWorkoutGoalPickerOpen: false,
        activeSession: {
          trackId,
          title: getWorkoutTrack(trackId).title,
          focusName: day.focusName,
          exercises,
          currentExerciseIndex: 0,
          startedAtMs: Date.now(),
          isPaused: false,
          pausedAtMs: null,
          totalPausedMs: 0,
          completionSummary: null,
        },
      });
    },

    startWorkout: () => {
      const { selectedTrackId, selectedWeek, selectedDayIndex, todayFocusName } = get();
      const day = resolveCurrentDay(selectedTrackId, selectedWeek, selectedDayIndex);
      const exercises = buildExercisesFromDay(day.exercises);

      set({
        activeSession: {
          trackId: selectedTrackId,
          title: getWorkoutTrack(selectedTrackId).title,
          focusName: todayFocusName,
          exercises,
          currentExerciseIndex: 0,
          startedAtMs: Date.now(),
          isPaused: false,
          pausedAtMs: null,
          totalPausedMs: 0,
          completionSummary: null,
        },
      });
    },

    cancelWorkout: () => set({ activeSession: null }),

    finishWorkout: async () => {
      const session = get().activeSession;
      if (!session || session.completionSummary) return null;

      const exercises = markExercisesCompleteThroughIndex(
        session.exercises,
        session.currentExerciseIndex,
      );
      const normalizedSession = { ...session, exercises };

      const durationMinutes = sessionDurationMinutes(
        normalizedSession.startedAtMs,
        normalizedSession.totalPausedMs,
        normalizedSession.isPaused,
        normalizedSession.pausedAtMs,
      );
      const stats = computeSessionStats(exercises);
      const xpEarned = computeWorkoutXp(stats, durationMinutes);
      const levelBefore = useGamificationStore.getState().profile?.level ?? 1;

      if (xpEarned > 0) {
        await useGamificationStore.getState().addXpAction(xpEarned, 'workout_completed');
      }

      const levelAfter = useGamificationStore.getState().profile?.level ?? levelBefore;
      const streakDays = Math.max(
        get().lifetimeStats.streakDays + 1,
        useGamificationStore.getState().profile?.days_active ?? 1,
      );

      const summary: WorkoutCompletionSummary = {
        focusName: session.focusName,
        programTitle: session.title,
        durationMinutes,
        xpEarned,
        levelUp: levelAfter > levelBefore,
        newLevel: levelAfter > levelBefore ? levelAfter : undefined,
        exerciseCount: stats.exerciseCount,
        completedExerciseCount: stats.completedExerciseCount,
        setCount: stats.completedSetCount,
        repCount: stats.repCount,
        tonnageKg: Math.round(stats.tonnageKg),
        newPrCount: 0,
        newPrNames: [],
        achievements: buildAchievements(stats, durationMinutes, streakDays),
      };

      set((state) => ({
        activeSession: { ...normalizedSession, completionSummary: summary },
        rpgStrengthXp: state.rpgStrengthXp + xpEarned,
        fatiguePercent: Math.min(95, state.fatiguePercent + 12),
        lifetimeStats: {
          ...state.lifetimeStats,
          totalWorkouts: state.lifetimeStats.totalWorkouts + 1,
          streakDays,
          longestStreakDays: Math.max(state.lifetimeStats.longestStreakDays, streakDays),
          totalMinutes: state.lifetimeStats.totalMinutes + durationMinutes,
          totalTonnageKg: state.lifetimeStats.totalTonnageKg + summary.tonnageKg,
        },
        lastSession: {
          title: session.focusName,
          relativeDay: 'Today',
          durationMinutes,
          xpEarned,
          exerciseCount: stats.exerciseCount,
          setCount: stats.completedSetCount,
          tonnageKg: Math.round(stats.tonnageKg),
        },
      }));

      void (async () => {
        const userId = useGamificationStore.getState().profile?.id;
        if (!userId) {
          return;
        }

        const saved = await upsertWorkoutSessionComplete(userId, {
          durationMinutes,
          xpEarned,
          trackSlug: session.trackId,
          dayFocus: session.focusName,
          caloriesBurned: Math.round(durationMinutes * 8),
          tonnageKg: summary.tonnageKg,
        });

        if (saved) {
          reportSyncSuccess('Workout saved to your stats.');
          useMetricsSyncStore.getState().bump();
        }

        const prResult = await processWorkoutPersonalRecords(userId, session.exercises);
        if (prResult.newPrCount > 0) {
          useHealthStore.setState((state) => {
            if (!state.activeSession?.completionSummary) return {};
            return {
              activeSession: {
                ...state.activeSession,
                completionSummary: {
                  ...state.activeSession.completionSummary,
                  newPrCount: prResult.newPrCount,
                  newPrNames: prResult.prNames,
                  achievements: [
                    ...state.activeSession.completionSummary.achievements,
                    ...prResult.prNames.map((name) => `New PR · ${name}`),
                  ],
                },
              },
            };
          });
        }

        try {
          const remoteStats = await fetchWorkoutLifetimeStats(userId);
          useHealthStore.setState((state) => ({
            lifetimeStats: mergeLifetimeStats(state.lifetimeStats, remoteStats),
          }));
        } catch (error) {
          console.warn('[HealthStore] Failed to refresh lifetime stats:', error);
        }
      })();

      return summary;
    },

    dismissWorkoutCompletion: () => set({ activeSession: null }),

    advanceExerciseOrFinish: async () => {
      const session = get().activeSession;
      if (!session || session.completionSummary) return null;

      const isLast = session.currentExerciseIndex >= session.exercises.length - 1;
      const exercises = markExercisesCompleteThroughIndex(
        session.exercises,
        session.currentExerciseIndex,
      );

      if (isLast) {
        set({ activeSession: { ...session, exercises } });
        return get().finishWorkout();
      }

      set({
        activeSession: {
          ...session,
          exercises,
          currentExerciseIndex: session.currentExerciseIndex + 1,
        },
      });
      return null;
    },

    goToNextExercise: () => {
      const session = get().activeSession;
      if (!session) return;
      const nextIndex = Math.min(session.exercises.length - 1, session.currentExerciseIndex + 1);
      set({ activeSession: { ...session, currentExerciseIndex: nextIndex } });
    },

    goToPreviousExercise: () => {
      const session = get().activeSession;
      if (!session) return;
      const prevIndex = Math.max(0, session.currentExerciseIndex - 1);
      set({ activeSession: { ...session, currentExerciseIndex: prevIndex } });
    },

    selectExercise: (index) => {
      const session = get().activeSession;
      if (!session) return;
      set({
        activeSession: { ...session, currentExerciseIndex: index },
      });
    },

    toggleSet: (exerciseId, setId) => {
      const session = get().activeSession;
      if (!session || session.completionSummary) return;

      const exercises = session.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.id === setId ? { ...s, completed: !s.completed } : s,
          ),
        };
      });

      const currentExercise = exercises[session.currentExerciseIndex];
      let nextIndex = session.currentExerciseIndex;

      if (currentExercise && isExerciseComplete(currentExercise)) {
        const autoNext = findNextIncompleteExerciseIndex(
          exercises,
          session.currentExerciseIndex + 1,
        );
        if (autoNext != null) nextIndex = autoNext;
      }

      set({
        activeSession: {
          ...session,
          exercises,
          currentExerciseIndex: nextIndex,
        },
      });
    },

    adjustSetWeight: (exerciseId, setId, delta) => {
      const session = get().activeSession;
      if (!session) return;

      set({
        activeSession: {
          ...session,
          exercises: session.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId
                  ? { ...s, weightKg: Math.max(0, Math.round((s.weightKg + delta) * 2) / 2) }
                  : s,
              ),
            };
          }),
        },
      });
    },

    adjustSetReps: (exerciseId, setId, delta) => {
      const session = get().activeSession;
      if (!session) return;

      set({
        activeSession: {
          ...session,
          exercises: session.exercises.map((ex) => {
            if (ex.id !== exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId
                  ? { ...s, reps: Math.max(0, s.reps + delta) }
                  : s,
              ),
            };
          }),
        },
      });
    },

    togglePause: () => {
      const session = get().activeSession;
      if (!session) return;

      if (session.isPaused) {
        const pauseDelta = session.pausedAtMs ? Date.now() - session.pausedAtMs : 0;
        set({
          activeSession: {
            ...session,
            isPaused: false,
            pausedAtMs: null,
            totalPausedMs: session.totalPausedMs + pauseDelta,
          },
        });
        return;
      }

      set({
        activeSession: {
          ...session,
          isPaused: true,
          pausedAtMs: Date.now(),
        },
      });
    },

    swapMeal: (slot, newMealId) => {
      let nextSnapshot: NutritionDaySnapshot | null = null;

      set((state) => {
        const quickMeals = { ...state.quickMeals };
        delete quickMeals[slot];
        const mealLog = { ...state.mealLog, [slot]: newMealId };
        const consumedMacros = sumMacrosFromLog(mealLog, quickMeals);
        nextSnapshot = {
          mealLog,
          quickMeals,
          calorieTarget: state.dietPlan.calories,
          caloriesConsumed: consumedMacros.calories,
        };
        return {
          nutritionDayKey: toDayKey(new Date()),
          mealLog,
          quickMeals,
          consumedMacros,
          remainingCalories: state.dietPlan.calories - consumedMacros.calories,
          swapTarget: null,
        };
      });

      if (nextSnapshot) {
        const userId = useGamificationStore.getState().profile?.id;
        if (userId) {
          void persistTodayNutrition(userId, nextSnapshot);
        }
      }
    },

    logQuickMeal: (slot, name, calories) => {
      let nextSnapshot: NutritionDaySnapshot | null = null;

      set((state) => {
        const quickMeals = {
          ...state.quickMeals,
          [slot]: { name, calories },
        };
        const consumedMacros = sumMacrosFromLog(state.mealLog, quickMeals);
        nextSnapshot = {
          mealLog: state.mealLog,
          quickMeals,
          calorieTarget: state.dietPlan.calories,
          caloriesConsumed: consumedMacros.calories,
        };
        return {
          nutritionDayKey: toDayKey(new Date()),
          quickMeals,
          consumedMacros,
          remainingCalories: state.dietPlan.calories - consumedMacros.calories,
        };
      });

      if (nextSnapshot) {
        const userId = useGamificationStore.getState().profile?.id;
        if (userId) {
          void persistTodayNutrition(userId, nextSnapshot);
        }
      }
    },

    resetDailyNutrition: (dayKey) => {
      set((state) => ({
        nutritionDayKey: dayKey,
        ...emptyNutritionFields(state.dietPlan.calories),
      }));
    },

    hydrateNutrition: (snapshot, dayKey = toDayKey(new Date())) => {
      set((state) => {
        const calorieTarget = state.dietPlan.calories;
        const consumedFromSlots = sumMacrosFromLog(snapshot.mealLog, snapshot.quickMeals);
        const consumedMacros =
          consumedFromSlots.calories > 0
            ? consumedFromSlots
            : {
                calories: snapshot.caloriesConsumed,
                protein: 0,
                fat: 0,
                carbs: 0,
              };

        return {
          nutritionDayKey: dayKey,
          mealLog: snapshot.mealLog,
          quickMeals: snapshot.quickMeals,
          consumedMacros,
          remainingCalories: calorieTarget - consumedMacros.calories,
        };
      });
    },

    applyNutritionTargets: (targets) => {
      set((state) => ({
        dietPlan: targets.dietPlan,
        waterTargetLiters: targets.waterTargetMl / 1000,
        remainingCalories: targets.dietPlan.calories - state.consumedMacros.calories,
      }));
    },

    openSwapPicker: (slot, mealId) => set({ swapTarget: { slot, mealId } }),
    closeSwapPicker: () => set({ swapTarget: null }),

    getSwapOptions: (mealId) => {
      const meal = getMealById(mealId);
      return meal?.swap_ids ?? [];
    },
  };
});

export const selectEnergyLabel = (level: EnergyLevel) => {
  switch (level) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
  }
};

export function useShowDomsBanner(): boolean {
  const trackId = useHealthStore((s) => s.selectedTrackId);
  const dismissed = useHealthStore((s) => s.domsBannerDismissed);
  const fatigue = useHealthStore((s) => s.fatiguePercent);
  return trackId === 'maintenance' && !dismissed && fatigue >= 75;
}

export function useCurrentProgramDay() {
  const trackId = useHealthStore((s) => s.selectedTrackId);
  const week = useHealthStore((s) => s.selectedWeek);
  const dayIndex = useHealthStore((s) => s.selectedDayIndex);
  const days = listDaysForWeek(trackId, week);
  return days[dayIndex] ?? getProgramDay(trackId, week, 1);
}

export function useTodayWorkoutPreview() {
  const focusName = useHealthStore((s) => s.todayFocusName);
  const exerciseCount = useHealthStore((s) => s.todayExerciseCount);
  const estimatedMinutes = useHealthStore((s) => s.todayEstimatedMinutes);
  const programTitle = useHealthStore((s) => s.todayWorkoutTitle);
  return { focusName, exerciseCount, estimatedMinutes, programTitle };
}
