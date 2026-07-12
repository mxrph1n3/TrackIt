import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';

import { AUTH_CALLBACK_PATH, AUTH_SCHEME } from './deepLinking';
import { IS_WEB } from '../platform/constants';
import { isSupabaseConfigured, supabase } from '../supabase';

export function getAuthRedirectUri() {
  if (IS_WEB && typeof window !== 'undefined') {
    return `${window.location.origin}/${AUTH_CALLBACK_PATH}`;
  }

  return makeRedirectUri({
    scheme: AUTH_SCHEME,
    path: AUTH_CALLBACK_PATH,
  });
}

function isOAuthCallbackUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  if (normalized.includes('access_token=') || normalized.includes('refresh_token=')) {
    return true;
  }

  if (IS_WEB) {
    try {
      const parsed = new URL(url);
      return parsed.pathname.replace(/^\//, '').includes(AUTH_CALLBACK_PATH);
    } catch {
      return false;
    }
  }

  return normalized.includes(AUTH_CALLBACK_PATH) && normalized.startsWith(`${AUTH_SCHEME}://`);
}

export async function createSessionFromUrl(url: string) {
  if (!isOAuthCallbackUrl(url)) {
    throw new Error('OAuth callback URL did not match the expected redirect.');
  }

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
