import { getDefaultDayIndex, listDaysForWeek } from '../../constants/workoutPrograms';
import { estimateDayDurationMinutes } from './workoutEngine';
import type { DayPlan, LastWorkoutSession, WorkoutLifetimeStats } from '../../types/health';
import type { ProgramDay, WorkoutTrackId } from '../../types/workout';

const WEEK_TARGET = 5;

export function formatMuscleGroups(focusName: string): string {
  const lower = focusName.toLowerCase();
  if (lower.includes('rest') || lower.includes('recovery')) return 'Mobility · Light movement';
  if (lower.includes('cardio')) return 'Zone 1–2 · Endurance';
  if (lower.includes('push') || lower.includes('press')) return 'Chest · Shoulders · Triceps';
  if (lower.includes('pull') || lower.includes('back')) return 'Back · Biceps · Rear delts';
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('lower')) {
    return 'Quads · Glutes · Hamstrings';
  }
  if (lower.includes('upper')) return 'Chest · Back · Arms';
  if (lower.includes('core') || lower.includes('full')) return 'Full body · Core';
  if (lower.includes('arm')) return 'Biceps · Triceps · Forearms';
  return focusName;
}

export function buildWeeklyPlan(
  trackId: WorkoutTrackId,
  weekNumber: number,
  dayIndex: number,
): DayPlan[] {
  const days = listDaysForWeek(trackId, weekNumber);
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return days.map((day, index) => {
    const isRest = day.exercises.length === 0 || /rest|recovery/i.test(day.focusName);
    const estimatedMinutes = isRest ? 0 : estimateDayDurationMinutes(day.exercises.length);
    const xpReward = isRest ? 0 : Math.min(520, 120 + day.exercises.length * 12);

    return {
      dayKey: `w${weekNumber}-d${day.dayNumber}`,
      dayLabel: labels[index] ?? `D${day.dayNumber}`,
      split: day.focusName,
      isToday: index === dayIndex,
      isRest,
      estimatedMinutes,
      xpReward,
      isCompleted: index < dayIndex,
      isUpcoming: index > dayIndex,
    };
  });
}

export function findNextTrainingDay(
  weeklyPlan: DayPlan[],
  fromIndex: number,
): { day: DayPlan; index: number; stepsAhead: number } | null {
  if (weeklyPlan.length === 0) return null;

  for (let offset = 1; offset <= weeklyPlan.length; offset += 1) {
    const index = (fromIndex + offset) % weeklyPlan.length;
    const day = weeklyPlan[index];
    if (!day.isRest) {
      return { day, index, stepsAhead: offset };
    }
  }

  return null;
}

export function formatNextWorkoutWhen(stepsAhead: number, dayLabel: string): string {
  if (stepsAhead <= 1) return 'Tomorrow';
  if (stepsAhead === 0) return 'Today';
  return dayLabel;
}

export type DashboardWorkoutSnapshot = {
  calendarDayIndex: number;
  programDay: ProgramDay;
  todayPlan: DayPlan;
  weeklyPlan: DayPlan[];
  nextTraining: { day: DayPlan; stepsAhead: number } | null;
  isRestDay: boolean;
  focusName: string;
  exerciseCount: number;
  estimatedMinutes: number;
  muscleGroups: string;
  weekProgressLine: string;
};

export function buildDashboardWorkoutSnapshot(
  trackId: WorkoutTrackId,
  week: number,
  lastSession: LastWorkoutSession,
  lifetimeStats: WorkoutLifetimeStats,
): DashboardWorkoutSnapshot {
  const calendarDayIndex = getDefaultDayIndex(trackId, week);
  const programDays = listDaysForWeek(trackId, week);
  const programDay = programDays[calendarDayIndex] ?? programDays[0];
  const weeklyPlan = buildWeeklyPlan(trackId, week, calendarDayIndex);
  const todayPlan = weeklyPlan[calendarDayIndex] ?? weeklyPlan[0];
  const nextTraining = findNextTrainingDay(weeklyPlan, calendarDayIndex);
  const isRestDay = todayPlan?.isRest ?? programDay.exercises.length === 0;

  const trainingDays = weeklyPlan.filter((day) => !day.isRest);
  const weeklyTarget = Math.min(WEEK_TARGET, trainingDays.length || WEEK_TARGET);
  let completed = weeklyPlan
    .slice(0, calendarDayIndex)
    .filter((day) => !day.isRest).length;

  if (lastSession.relativeDay === 'Today' && lastSession.title !== '—') {
    completed = Math.min(weeklyTarget, completed + 1);
  }

  const weekProgressLine =
    lifetimeStats.streakDays > 0
      ? `Streak · ${lifetimeStats.streakDays} days`
      : `${completed} of ${weeklyTarget} workouts this week`;

  return {
    calendarDayIndex,
    programDay,
    todayPlan,
    weeklyPlan,
    nextTraining: nextTraining
      ? { day: nextTraining.day, stepsAhead: nextTraining.stepsAhead }
      : null,
    isRestDay,
    focusName: programDay.focusName,
    exerciseCount: programDay.exercises.length,
    estimatedMinutes: todayPlan?.estimatedMinutes ?? estimateDayDurationMinutes(programDay.exercises.length),
    muscleGroups: formatMuscleGroups(programDay.focusName),
    weekProgressLine,
  };
}
