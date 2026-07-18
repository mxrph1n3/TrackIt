import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { supabaseAuthStorage } from './supabaseAuthStorage';
import {
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
} from './supabasePublicDefaults';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

type PostgrestErrorLike = {
  code?: string;
  message?: string;
};

/** True when PostgREST/Postgres reports a missing table or stale schema cache. */
export function isMissingSchemaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as PostgrestErrorLike).code;
  return code === 'PGRST205' || code === '42P01';
}
