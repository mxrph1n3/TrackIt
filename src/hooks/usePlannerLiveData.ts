import { useCallback, useEffect, useMemo, useState } from 'react';

import { toggleHabitLog } from '../lib/habits/service';
import {
  buildPrioritizedTasks,
  buildProjectTimelines,
} from '../lib/planner/presentation';
import {
  fetchCalendarEventsForDay,
  fetchHabitsForDay,
  fetchJournalEntry,
  fetchTasksForDay,
  fetchTasksForTimeline,
  upsertJournalEntry,
} from '../lib/planner/service';
import { insertSubtask } from '../lib/planner/subtaskService';
import { reportSyncError, reportSyncSuccess } from '../lib/sync/reportSyncError';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useTasksSyncStore } from '../stores/useTasksSyncStore';
import type { DayAgenda, JournalEntry } from '../types/planner';
import {
  addDays,
  buildMonthGrid,
  buildTimelineWindowDays,
  buildWeekForDate,
  formatMonthYear,
  getWeekStart,
  parseDayKey,
  timelineNowPosition,
  toDayKey,
} from '../utils/plannerDates';
import { usePlannerTaskActions } from './usePlannerTaskActions';
import { useProgression } from './useProgression';

const EMPTY_JOURNAL_BODY =
  'No reflection logged for this day yet. Tap the menu to add a journal entry when you are ready.';

export function usePlannerLiveData() {
  const { profile, awardHabitCompletion } = useProgression();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0);
  });
  const [selectedDayKey, setSelectedDayKey] = useState(() => toDayKey(new Date()));
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [tasks, setTasks] = useState<DayAgenda['tasks']>([]);
  const [timelineTasks, setTimelineTasks] = useState<DayAgenda['tasks']>([]);
  const [habits, setHabits] = useState<DayAgenda['habits']>([]);
  const [events, setEvents] = useState<DayAgenda['events']>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = useMemo(() => buildWeekForDate(weekStart), [weekStart]);
  const monthGrid = useMemo(
    () => buildMonthGrid(viewMonth, selectedDayKey),
    [selectedDayKey, viewMonth],
  );

  const monthLabel = useMemo(() => formatMonthYear(viewMonth), [viewMonth]);
  const timelineDays = useMemo(
    () => buildTimelineWindowDays(selectedDayKey),
    [selectedDayKey],
  );
  const timelineNow = useMemo(
    () => timelineNowPosition(selectedDayKey),
    [selectedDayKey],
  );

  const prioritizedTasks = useMemo(() => buildPrioritizedTasks(tasks), [tasks]);

  const projectTimelines = useMemo(
    () => buildProjectTimelines(timelineTasks, selectedDayKey),
    [selectedDayKey, timelineTasks],
  );

  const journalIsEmpty = journal === null;

  const journalDisplay: JournalEntry = useMemo(() => {
    if (journal) {
      return journal;
    }

    return {
      timestamp: '—',
      body: EMPTY_JOURNAL_BODY,
    };
  }, [journal]);

  const agenda: DayAgenda = useMemo(
    () => ({
      journal: journalDisplay,
      habits,
      tasks,
      events,
    }),
    [events, habits, journalDisplay, tasks],
  );

  const loadDayData = useCallback(async () => {
    setIsLoading((current) => (tasks.length > 0 || journal !== null ? current : true));

    try {
      const userId = profile?.id ?? useGamificationStore.getState().profile?.id;

      if (!userId) {
        setJournal(null);
        setTasks([]);
        setTimelineTasks([]);
        setHabits([]);
        setEvents([]);
        return;
      }

      const [entry, dayTasks, timelineWindowTasks, dayHabits, dayEvents] = await Promise.all([
        fetchJournalEntry(userId, selectedDayKey),
        fetchTasksForDay(userId, selectedDayKey),
        fetchTasksForTimeline(userId, selectedDayKey),
        fetchHabitsForDay(userId, selectedDayKey),
        fetchCalendarEventsForDay(userId, selectedDayKey),
      ]);

      setJournal(entry);
      setTasks(dayTasks);
      setTimelineTasks(timelineWindowTasks);
      setHabits(dayHabits);
      setEvents(dayEvents);
    } catch (error) {
      reportSyncError('Planner', error, 'Could not load planner data.');
      setJournal(null);
      setTasks([]);
      setTimelineTasks([]);
      setHabits([]);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id, selectedDayKey]);

  useEffect(() => {
    void loadDayData();
  }, [loadDayData]);

  const tasksSyncVersion = useTasksSyncStore((s) => s.version);
  const notifyTaskMutation = useTasksSyncStore((s) => s.notifyTaskMutation);

  useEffect(() => {
    if (tasksSyncVersion === 0) {
      return;
    }

    void loadDayData();
  }, [loadDayData, tasksSyncVersion]);

  useEffect(() => {
    const userId = profile?.id ?? useGamificationStore.getState().profile?.id;
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel(`planner-day-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => {
          void loadDayData();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_subtasks', filter: `user_id=eq.${userId}` },
        () => {
          void loadDayData();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journal_entries', filter: `user_id=eq.${userId}` },
        () => {
          void loadDayData();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${userId}` },
        () => {
          void loadDayData();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${userId}` },
        () => {
          void loadDayData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDayData, profile?.id]);

  const { toggleTask, toggleSubtask } = usePlannerTaskActions({
    tasks,
    setTasks,
    onAfterToggle: () => {
      notifyTaskMutation();
    },
  });

  const selectDay = useCallback((dayKey: string) => {
    setSelectedDayKey(dayKey);
    const date = parseDayKey(dayKey);
    setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0));
    setWeekStart(getWeekStart(date));
  }, []);

  const goToPreviousMonth = useCallback(() => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1, 12, 0, 0, 0));
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1, 12, 0, 0, 0));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setWeekStart((current) => addDays(current, -7));
    setSelectedDayKey((current) => toDayKey(addDays(parseDayKey(current), -7)));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((current) => addDays(current, 7));
    setSelectedDayKey((current) => toDayKey(addDays(parseDayKey(current), 7)));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    const today = new Date();
    setWeekStart(getWeekStart(today));
    setSelectedDayKey(toDayKey(today));
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0));
  }, []);

  const toggleHabit = useCallback(
    async (habitId: string) => {
      const userId = profile?.id ?? useGamificationStore.getState().profile?.id;
      const item = habits.find((habit) => habit.id === habitId);
      if (!userId || !item) {
        return;
      }

      const nextCompleted = !item.completed;
      setHabits((current) =>
        current.map((habit) =>
          habit.id === habitId ? { ...habit, completed: nextCompleted } : habit,
        ),
      );

      try {
        await toggleHabitLog(userId, habitId, selectedDayKey, nextCompleted);
        if (nextCompleted) {
          await awardHabitCompletion(userId, habitId);
        }
      } catch (error) {
        reportSyncError('Planner', error, 'Could not update the habit.');
        setHabits((current) =>
          current.map((habit) =>
            habit.id === habitId ? { ...habit, completed: item.completed } : habit,
          ),
        );
      }
    },
    [awardHabitCompletion, habits, profile?.id, selectedDayKey],
  );

  const saveJournal = useCallback(
    async (body: string) => {
      const userId = profile?.id ?? useGamificationStore.getState().profile?.id;
      if (!userId) {
        return;
      }

      try {
        await upsertJournalEntry(userId, selectedDayKey, body);
        await loadDayData();
        reportSyncSuccess('Journal saved.');
      } catch (error) {
        reportSyncError('Planner', error, 'Could not save journal.');
        throw error;
      }
    },
    [loadDayData, profile?.id, selectedDayKey],
  );

  const addSubtask = useCallback(
    async (taskId: string, title: string) => {
      const userId = profile?.id ?? useGamificationStore.getState().profile?.id;
      if (!userId) {
        return;
      }

      try {
        await insertSubtask(userId, taskId, title);
        await loadDayData();
        notifyTaskMutation();
        reportSyncSuccess('Subtask added.');
      } catch (error) {
        reportSyncError('Planner', error, 'Could not add the subtask.');
        throw error;
      }
    },
    [loadDayData, notifyTaskMutation, profile?.id],
  );

  return {
    weekDays,
    monthGrid,
    selectedDayKey,
    monthLabel,
    timelineDays,
    timelineNow,
    prioritizedTasks,
    projectTimelines,
    selectDay,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    agenda,
    journalIsEmpty,
    isLoading,
    toggleTask,
    toggleSubtask,
    toggleHabit,
    addSubtask,
    saveJournal,
    refresh: loadDayData,
  };
}
