import { toErrorMessage } from '../leaderboardMappers';
import { isSupabaseConfigured, supabase } from '../supabase';
import {
  mapUsernameUpdateError,
  validateUsername,
  type UsernameValidationResult,
} from './usernameValidation';

export type UpdateUsernameResult = {
  success: boolean;
  error: string | null;
  username?: string;
};

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

export async function updateProfileUsername(
  userId: string,
  rawUsername: string,
): Promise<UpdateUsernameResult> {
  const validation = validateUsername(rawUsername);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('profiles')
    .update({ username: validation.normalized })
    .eq('id', userId)
    .select('username')
    .maybeSingle();

  if (error) {
    return { success: false, error: mapUsernameUpdateError(error) };
  }

  if (!data?.username) {
    return { success: false, error: toErrorMessage(new Error('Profile update returned no data.')) };
  }

  return { success: true, error: null, username: String(data.username) };
}

export { validateUsername, type UsernameValidationResult };
