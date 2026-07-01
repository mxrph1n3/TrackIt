import type { PlannerSubtask } from '../../types/planner';
import type { TaskSubtaskRow } from '../../types/database';
import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../supabase';

export async function fetchSubtasksForTaskIds(
  userId: string,
  taskIds: string[],
): Promise<Map<string, PlannerSubtask[]>> {
  const grouped = new Map<string, PlannerSubtask[]>();
  if (!isSupabaseConfigured || taskIds.length === 0) {
    return grouped;
  }

  const { data, error } = await supabase
    .from('task_subtasks')
    .select('id, task_id, title, completed, sort_order')
    .eq('user_id', userId)
    .in('task_id', taskIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) {
      return grouped;
    }
    throw error;
  }

  for (const row of (data ?? []) as TaskSubtaskRow[]) {
    const list = grouped.get(row.task_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      completed: row.completed,
    });
    grouped.set(row.task_id, list);
  }

  return grouped;
}

export async function fetchOpenTasksForSubtask(
  userId: string,
  limit = 20,
): Promise<Array<{ id: string; title: string }>> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingSchemaError(error)) {
      return [];
    }
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title),
  }));
}

export async function insertSubtask(
  userId: string,
  taskId: string,
  title: string,
): Promise<TaskSubtaskRow> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('Subtask title is required.');
  }

  const { data, error } = await supabase
    .from('task_subtasks')
    .insert({
      user_id: userId,
      task_id: taskId,
      title: trimmed,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as TaskSubtaskRow;
}

export async function toggleSubtaskCompletion(
  subtaskId: string,
  completed: boolean,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('task_subtasks')
    .update({ completed })
    .eq('id', subtaskId);

  if (error) {
    throw error;
  }
}

export async function setSubtasksCompletionForTask(
  userId: string,
  taskId: string,
  completed: boolean,
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('task_subtasks')
    .update({ completed })
    .eq('user_id', userId)
    .eq('task_id', taskId);

  if (error) {
    throw error;
  }
}
