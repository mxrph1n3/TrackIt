import { supabase } from '../supabase';

/**
 * Permanently deletes the signed-in user's account and all data
 * (user tables cascade from auth.users). Signs out locally on success.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });

  if (error) {
    throw new Error(error.message ?? 'Could not delete account.');
  }

  await supabase.auth.signOut();
}
