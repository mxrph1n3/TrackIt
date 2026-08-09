import { isSupabaseConfigured, supabase } from '../supabase';
import {
  mapUsernameUpdateError,
  validateUsername,
  type UsernameValidationResult,
} from './usernameValidation';

export type UpdateUsernameResult = {
  success: boolean;
  errorKey: string | null;
  errorParams?: Record<string, number | string>;
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
    return {
      success: false,
      errorKey: validation.errorKey,
      errorParams: validation.errorParams,
    };
  }

  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('profiles')
    .update({ username: validation.normalized })
    .eq('id', userId)
    .select('username')
    .maybeSingle();

  if (error) {
    const mapped = mapUsernameUpdateError(error);
    return { success: false, errorKey: mapped.errorKey, errorParams: mapped.errorParams };
  }

  if (!data?.username) {
    return { success: false, errorKey: 'profile.usernameErrors.updateFailed' };
  }

  return { success: true, errorKey: null, username: String(data.username) };
}

export { validateUsername, type UsernameValidationResult };
