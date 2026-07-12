import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Clock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { MEAL_SLOT_ORDER, MEAL_SLOT_TIMES } from '../../../constants/mealSlots';
import { getMealById, SLOT_LABELS } from '../../../constants/meals';
import { useHealthNavigation } from '../../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useTodayNutrition } from '../../../hooks/useTodayNutrition';
import { triggerHaptic } from '../../../lib/platform/haptics';
import type { DailyMealLog, MealSlot, QuickMealLog } from '../../../types/health';
import { PremiumCard } from '../ui/PremiumCard';

const MEAL_TARGET = MEAL_SLOT_ORDER.length;

function formatCountdown(targetTime: string, now: Date): string {
  const [hours, minutes] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return [h, m, s].map((part) => String(part).padStart(2, '0')).join(':');
}

function useMealsTimelineStyles() {
  return useHealthStyles((t) => ({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
    },
    count: {
      fontSize: 12,
      fontWeight: '600',
      color: t.muted,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    status: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: t.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusDone: {
      backgroundColor: t.accent,
    },
    copy: {
      flex: 1,
    },
    slot: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: t.slate,
    },
    mealName: {
      marginTop: 2,
      fontSize: 16,
      fontWeight: '700',
      color: t.ink,
    },
    calories: {
      marginTop: 4,
      fontSize: 13,
      color: t.accent,
      fontWeight: '700',
    },
    time: {
      marginTop: 4,
      fontSize: 13,
      color: t.muted,
      fontWeight: '600',
    },
    nextKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
    },
    nextTitle: {
      marginTop: 6,
      fontSize: 22,
      fontWeight: '800',
      color: t.ink,
    },
    nextTime: {
      marginTop: 4,
      fontSize: 15,
      fontWeight: '600',
      color: t.muted,
    },
    countdown: {
      marginTop: 10,
      fontSize: 28,
      fontWeight: '900',
      color: t.accent,
      letterSpacing: 1,
      fontVariant: ['tabular-nums'],
    },
  }));
}

function isSlotLogged(slot: MealSlot, mealLog: DailyMealLog, quickMeals: QuickMealLog): boolean {
  return Boolean(mealLog[slot]) || Boolean(quickMeals[slot]);
}

export function MealsTimeline() {
  const { mealLog, quickMeals } = useTodayNutrition();
  const { push } = useHealthNavigation();
  const healthTheme = useHealthTheme();
  const styles = useMealsTimelineStyles();
  const completed = MEAL_SLOT_ORDER.filter((slot) => isSlotLogged(slot, mealLog, quickMeals)).length;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Meals</Text>
        <Text style={styles.count}>
          {completed} / {MEAL_TARGET} completed
        </Text>
      </View>

      {MEAL_SLOT_ORDER.map((slot) => {
        const mealId = mealLog[slot];
        const meal = mealId ? getMealById(mealId) : null;
        const quickMeal = quickMeals[slot];
        const done = Boolean(meal) || Boolean(quickMeal);
        const displayName = meal?.name ?? quickMeal?.name ?? 'Pending';
        const displayCalories = meal?.macros.calories ?? quickMeal?.calories;

        return (
          <Pressable
            key={slot}
            onPress={() => {
              void triggerHaptic('selection');
              if (meal) {
                push('MealDetails', { mealSlot: slot });
              } else {
                push('FoodSearch', { targetSlot: slot });
              }
            }}
          >
            <PremiumCard padding={16}>
              <View style={styles.row}>
                <View style={[styles.status, done && styles.statusDone]}>
                  {done ? (
                    <Check color={healthTheme.ink} size={14} strokeWidth={3} />
                  ) : (
                    <Clock color={healthTheme.slate} size={14} />
                  )}
                </View>
                <View style={styles.copy}>
                  <Text style={styles.slot}>{SLOT_LABELS[slot]}</Text>
                  <Text style={styles.mealName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {done && displayCalories ? (
                    <Text style={styles.calories}>{displayCalories} kcal</Text>
                  ) : (
                    <Text style={styles.time}>{MEAL_SLOT_TIMES[slot]}</Text>
                  )}
                </View>
                <ChevronRight color={healthTheme.muted} size={18} />
              </View>
            </PremiumCard>
          </Pressable>
        );
      })}
    </View>
  );
}

export function NextMealCard() {
  const { mealLog, quickMeals } = useTodayNutrition();
  const { push } = useHealthNavigation();
  const [now, setNow] = useState(() => new Date());
  const styles = useMealsTimelineStyles();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextEntry = useMemo(() => {
    const pendingSlot = MEAL_SLOT_ORDER.find((slot) => !isSlotLogged(slot, mealLog, quickMeals));
    if (!pendingSlot) {
      return null;
    }

    return {
      slot: pendingSlot,
      label: SLOT_LABELS[pendingSlot],
      time: MEAL_SLOT_TIMES[pendingSlot],
    };
  }, [mealLog, quickMeals]);

  if (!nextEntry) {
    return null;
  }

  return (
    <PremiumCard onPress={() => push('FoodSearch', { targetSlot: nextEntry.slot })}>
      <Text style={styles.nextKicker}>Next Meal</Text>
      <Text style={styles.nextTitle}>{nextEntry.label}</Text>
      <Text style={styles.nextTime}>{nextEntry.time}</Text>
      <Text style={styles.countdown}>{formatCountdown(nextEntry.time, now)}</Text>
    </PremiumCard>
  );
}
