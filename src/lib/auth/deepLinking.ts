/** Must match `expo.scheme` in app.json for Google OAuth deep linking. */
export const AUTH_SCHEME = 'trackit2';

export const AUTH_CALLBACK_PATH = 'auth/callback';

export function getAuthRedirectUrl() {
  return `${AUTH_SCHEME}://${AUTH_CALLBACK_PATH}`;
}
