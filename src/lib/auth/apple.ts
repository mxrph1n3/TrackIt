import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { isSupabaseConfigured, supabase } from '../supabase';

export async function isAppleSignInAvailable() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signInWithAppleNative() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add your environment variables first.');
  }

  const available = await isAppleSignInAvailable();
  if (!available) {
    throw new Error('Sign in with Apple is not available on this device.');
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
}
