import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { AUTH_SCHEME, AUTH_CALLBACK_PATH } from './deepLinking';
import { isSupabaseConfigured, supabase } from '../supabase';

WebBrowser.maybeCompleteAuthSession();

export function getAuthRedirectUri() {
  return makeRedirectUri({
    scheme: AUTH_SCHEME,
    path: AUTH_CALLBACK_PATH,
  });
}

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken) {
    throw new Error('OAuth callback did not include an access token.');
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return data.session;
}

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
