import { IS_WEB } from '../platform/constants';
import { isSupabaseConfigured, supabase } from '../supabase';
import { createSessionFromUrl, getAuthRedirectUri } from './oauth.shared';

export { getAuthRedirectUri, createSessionFromUrl } from './oauth.shared';

function isOAuthCallbackUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  if (normalized.includes('access_token=') || normalized.includes('refresh_token=')) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, '').includes('auth/callback');
  } catch {
    return false;
  }
}

export async function completeOAuthSessionFromCurrentUrl() {
  if (!IS_WEB || typeof window === 'undefined' || !isSupabaseConfigured) {
    return null;
  }

  const href = window.location.href;
  if (!isOAuthCallbackUrl(href)) {
    return null;
  }

  try {
    const session = await createSessionFromUrl(href);
    window.history.replaceState({}, document.title, window.location.pathname || '/');
    return session;
  } catch (error) {
    console.warn('[Auth] OAuth callback handling failed:', error);
    return null;
  }
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

  window.location.assign(data.url);
  return null;
}
