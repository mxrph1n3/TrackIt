import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { signInWithAppleOAuth } from './oauth';
import { isSupabaseConfigured, supabase } from '../supabase';

function isUserCancelledAppleSignIn(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  const normalized = `${code} ${message}`.toLowerCase();

  return (
    code === 'ERR_REQUEST_CANCELED' ||
    normalized.includes('canceled') ||
    normalized.includes('cancelled')
  );
}

function isMissingAppleEntitlementError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (isUserCancelledAppleSignIn(error)) {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  const normalized = `${code} ${message}`.toLowerCase();

  return (
    normalized.includes('entitlement') ||
    normalized.includes('not configured') ||
    normalized.includes('authorizationerror') ||
    code === 'ERR_REQUEST_UNKNOWN' ||
    code === 'ERR_REQUEST_FAILED'
  );
}

export async function isAppleSignInAvailable() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  // Always offer Apple on iOS: native SIWA when entitled, otherwise browser OAuth.
  return true;
}

export async function signInWithAppleNative() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add your environment variables first.');
  }

  try {
    const nativeAvailable = await AppleAuthentication.isAvailableAsync();
    if (!nativeAvailable) {
      return signInWithAppleOAuth();
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('Apple did not return a valid identity token.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      throw error;
    }

    return data.session;
  } catch (error) {
    if (isUserCancelledAppleSignIn(error)) {
      throw new Error('Apple sign-in was cancelled.');
    }
    if (isMissingAppleEntitlementError(error)) {
      return signInWithAppleOAuth();
    }
    throw error;
  }
}
