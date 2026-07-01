import { useCallback, useEffect, useState } from 'react';

import { fetchAllTasks, type TaskListFilter } from '../lib/planner/service';
import { insertSubtask } from '../lib/planner/subtaskService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useGamificationStore } from '../stores/useGamificationStore';
import type { PlannerTaskItem } from '../types/planner';
import { usePlannerTaskActions } from './usePlannerTaskActions';

export function useAllTasksData(initialFilter: TaskListFilter = 'open') {
  const userId = useGamificationStore((state) => state.profile?.id);
  const [filter, setFilter] = useState<TaskListFilter>(initialFilter);
  const [tasks, setTasks] = useState<PlannerTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading((current) => (tasks.length > 0 ? current : true));

    try {
      const rows = await fetchAllTasks(userId, filter);
      setTasks(rows);
    } catch (error) {
      console.warn('[AllTasks] Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter, tasks.length, userId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel(`planner-all-tasks-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => {
          void loadTasks();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_subtasks', filter: `user_id=eq.${userId}` },
        () => {
          void loadTasks();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadTasks, userId]);

  const { toggleTask, toggleSubtask } = usePlannerTaskActions({
    tasks,
    setTasks,
  });

  const addSubtask = useCallback(
    async (taskId: string, title: string) => {
      if (!userId) {
        return;
      }

      try {
        await insertSubtask(userId, taskId, title);
        await loadTasks();
      } catch (error) {
        console.warn('[AllTasks] Failed to add subtask:', error);
      }
    },
    [loadTasks, userId],
  );

  return {
    tasks,
    filter,
    setFilter,
    isLoading,
    toggleTask,
    toggleSubtask,
    addSubtask,
    refresh: loadTasks,
  };
}
