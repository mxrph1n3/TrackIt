import { computeHabitStreak } from '../habits/service';
import { isSupabaseConfigured, supabase } from '../supabase';
import { toDayKey } from '../../utils/plannerDates';
import {
  MISSION_MILESTONES,
  type MissionMilestoneId,
  type MissionMilestoneStatus,
} from '../../constants/missionRoadmap';

export type MissionMilestoneProgress = {
  id: MissionMilestoneId;
  title: string;
  subtitle: string;
  order: number;
  status: MissionMilestoneStatus;
  progressPercent: number;
};

export type MissionRoadmapSnapshot = {
  overallPercent: number;
  milestones: MissionMilestoneProgress[];
  isLive: boolean;
};

const FOCUS_TARGET_MINUTES = 50 * 60;

function monthBounds(reference = new Date()): { start: string; end: string } {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function fetchBestHabitStreak(userId: string): Promise<number> {
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - 120);

  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (habitsError || !habits?.length) {
    return 0;
  }

  const { data: logs, error: logsError } = await supabase
    .from('habit_logs')
    .select('habit_id, logged_on')
    .eq('user_id', userId)
    .eq('completed', true)
    .gte('logged_on', toDayKey(rangeStart));

  if (logsError || !logs?.length) {
    return 0;
  }

  const logsByHabit = new Map<string, Set<string>>();
  for (const row of logs) {
    const habitId = String(row.habit_id);
    if (!logsByHabit.has(habitId)) {
      logsByHabit.set(habitId, new Set());
    }
    logsByHabit.get(habitId)?.add(String(row.logged_on));
  }

  let best = 0;
  for (const habit of habits) {
    const streak = computeHabitStreak(logsByHabit.get(String(habit.id)) ?? new Set());
    best = Math.max(best, streak);
  }

  return best;
}

async function fetchFocusMinutesThisMonth(userId: string): Promise<number> {
  const { start, end } = monthBounds();
  const { data, error } = await supabase
    .from('focus_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('session_type', 'focus')
    .gte('completed_at', start)
    .lt('completed_at', end);

  if (error || !data?.length) {
    return 0;
  }

  const totalSeconds = data.reduce((sum, row) => sum + Number(row.duration_seconds ?? 0), 0);
  return Math.round(totalSeconds / 60);
}

async function fetchNutritionOnTrackDays(userId: string, days = 7): Promise<number> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const startKey = toDayKey(start);

  const { data, error } = await supabase
    .from('daily_nutrition_logs')
    .select('calories_consumed, calorie_target')
    .eq('user_id', userId)
    .gte('log_date', startKey);

  if (error || !data?.length) {
    return 0;
  }

  return data.filter((row) => {
    const consumed = Number(row.calories_consumed ?? 0);
    const target = Number(row.calorie_target ?? 0);
    if (consumed <= 0 || target <= 0) {
      return false;
    }
    const ratio = consumed / target;
    return ratio >= 0.9 && ratio <= 1.1;
  }).length;
}

export async function fetchMissionRoadmap(userId: string): Promise<MissionRoadmapSnapshot> {
  if (!isSupabaseConfigured) {
    return {
      overallPercent: 0,
      milestones: MISSION_MILESTONES.map((item) => ({
        ...item,
        status: item.order === 1 ? 'active' : 'locked',
        progressPercent: 0,
      })),
      isLive: false,
    };
  }

  const [
    profileResult,
    habitsCountResult,
    habitLogsCountResult,
    bestStreak,
    focusMinutes,
    nutritionDays,
    financeGoalsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('level, habits_count').eq('id', userId).maybeSingle(),
    supabase
      .from('habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true),
    fetchBestHabitStreak(userId),
    fetchFocusMinutesThisMonth(userId),
    fetchNutritionOnTrackDays(userId),
    supabase
      .from('finance_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const level = Number(profileResult.data?.level ?? 1);
  const activeHabits = habitsCountResult.count ?? 0;
  const habitLogCount = habitLogsCountResult.count ?? 0;
  const financeGoals = financeGoalsResult.count ?? 0;

  const disciplineComplete = activeHabits >= 3 && habitLogCount >= 7;
  const consistencyComplete = bestStreak >= 14;
  const mindsetComplete = focusMinutes >= FOCUS_TARGET_MINUTES;
  const legacyComplete =
    mindsetComplete && nutritionDays >= 5 && financeGoals >= 1 && level >= 20;

  const completionById: Record<MissionMilestoneId, boolean> = {
    discipline_foundation: disciplineComplete,
    consistency_builder: consistencyComplete,
    mindset_upgrade: mindsetComplete,
    legacy_creator: legacyComplete,
  };

  const progressById: Record<MissionMilestoneId, number> = {
    discipline_foundation: Math.min(
      100,
      Math.round(((Math.min(activeHabits, 3) / 3) * 0.6 + Math.min(habitLogCount, 7) / 7 * 0.4) * 100),
    ),
    consistency_builder: Math.min(100, Math.round((bestStreak / 14) * 100)),
    mindset_upgrade: Math.min(100, Math.round((focusMinutes / FOCUS_TARGET_MINUTES) * 100)),
    legacy_creator: Math.min(
      100,
      Math.round(
        ((mindsetComplete ? 40 : 0) +
          (Math.min(nutritionDays, 5) / 5) * 30 +
          (financeGoals > 0 ? 15 : 0) +
          (Math.min(level, 20) / 20) * 15),
      ),
    ),
  };

  const milestones: MissionMilestoneProgress[] = MISSION_MILESTONES.map((item) => {
    const completed = completionById[item.id];
    let status: MissionMilestoneStatus = 'locked';

    if (completed) {
      status = 'completed';
    } else if (item.id === 'discipline_foundation') {
      status = 'active';
    } else if (item.id === 'consistency_builder' && disciplineComplete) {
      status = 'active';
    } else if (item.id === 'mindset_upgrade' && consistencyComplete) {
      status = 'active';
    } else if (item.id === 'legacy_creator' && mindsetComplete) {
      status = 'active';
    }

    return {
      ...item,
      status,
      progressPercent: completed ? 100 : progressById[item.id],
    };
  });

  const completedCount = milestones.filter((item) => item.status === 'completed').length;
  const active = milestones.find((item) => item.status === 'active');
  const activeProgress = active?.progressPercent ?? 0;
  const overallPercent = Math.round(
    (completedCount * 100 + activeProgress) / MISSION_MILESTONES.length,
  );

  return {
    overallPercent: Math.min(100, overallPercent),
    milestones,
    isLive: true,
  };
}
