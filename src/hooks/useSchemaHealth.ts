import { useCallback, useEffect, useState } from 'react';

import { isMissingSchemaError, isSupabaseConfigured, supabase } from '../lib/supabase';

export type SchemaHealthState = {
  isChecking: boolean;
  isHealthy: boolean;
  message: string | null;
  refresh: () => Promise<void>;
};

export function useSchemaHealth(enabled: boolean): SchemaHealthState {
  const [isChecking, setIsChecking] = useState(true);
  const [isHealthy, setIsHealthy] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !isSupabaseConfigured) {
      setIsHealthy(true);
      setMessage(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);

    const probes = await Promise.all([
      supabase.from('tasks').select('id').limit(1),
      supabase.from('daily_nutrition_logs').select('log_date').limit(1),
      supabase.from('habits').select('id').limit(1),
      supabase.from('meals').select('meal_id').limit(1),
      supabase.from('workout_tracks').select('slug').limit(1),
      supabase.from('task_subtasks').select('id').limit(1),
      supabase.from('mood_logs').select('id').limit(1),
      supabase.from('exercise_prs').select('id').limit(1),
    ]);

    const missing = probes.some((result) => isMissingSchemaError(result.error));
    if (missing) {
      setIsHealthy(false);
      setMessage('Database schema is out of date. Run supabase db push to apply pending migrations.');
    } else {
      setIsHealthy(true);
      setMessage(null);
    }

    setIsChecking(false);
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    isChecking,
    isHealthy,
    message,
    refresh,
  };
}
