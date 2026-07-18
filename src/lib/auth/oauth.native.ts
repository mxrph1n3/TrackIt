import * as WebBrowser from 'expo-web-browser';
import type { Provider } from '@supabase/supabase-js';

import { isSupabaseConfigured, supabase } from '../supabase';
import { createSessionFromUrl, getAuthRedirectUri } from './oauth.shared';

WebBrowser.maybeCompleteAuthSession();

export async function completeOAuthSessionFromCurrentUrl() {
  return null;
}

export { getAuthRedirectUri, createSessionFromUrl } from './oauth.shared';

async function signInWithOAuthProvider(provider: Provider, label: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add your environment variables first.');
  }

  const redirectTo = getAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error(`Unable to start ${label} sign-in.`);
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error(`${label} sign-in was cancelled.`);
  }

  if (result.type !== 'success') {
    throw new Error(`${label} sign-in did not complete.`);
  }

  return createSessionFromUrl(result.url);
}

export async function signInWithGoogleOAuth() {
  return signInWithOAuthProvider('google', 'Google');
}

/** Browser OAuth — works without native Sign in with Apple entitlement (e.g. Personal Team). */
export async function signInWithAppleOAuth() {
  return signInWithOAuthProvider('apple', 'Apple');
}
