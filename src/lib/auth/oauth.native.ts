import * as WebBrowser from 'expo-web-browser';

import { isSupabaseConfigured, supabase } from '../supabase';
import { createSessionFromUrl, getAuthRedirectUri } from './oauth.shared';

WebBrowser.maybeCompleteAuthSession();

export async function completeOAuthSessionFromCurrentUrl() {
  return null;
}

export { getAuthRedirectUri, createSessionFromUrl } from './oauth.shared';

export async function signInWithGoogleOAuth() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add your environment variables first.');
  }

  const redirectTo = getAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error('Unable to start Google sign-in.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Google sign-in was cancelled.');
  }

  if (result.type !== 'success') {
    throw new Error('Google sign-in did not complete.');
  }

  return createSessionFromUrl(result.url);
}
