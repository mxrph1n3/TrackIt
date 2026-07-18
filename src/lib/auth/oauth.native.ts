import * as WebBrowser from 'expo-web-browser';

import { createSessionFromUrl, getAuthRedirectUri } from './oauth.shared';

WebBrowser.maybeCompleteAuthSession();

export async function completeOAuthSessionFromCurrentUrl() {
  return null;
}

export { getAuthRedirectUri, createSessionFromUrl } from './oauth.shared';
