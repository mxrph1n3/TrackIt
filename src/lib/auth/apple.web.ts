/** Sign in with Apple is not available in Telegram Mini App / web builds. */

export async function isAppleSignInAvailable(): Promise<boolean> {
  return false;
}

export async function signInWithAppleNative(): Promise<never> {
  throw new Error('Sign in with Apple is not available on web.');
}
