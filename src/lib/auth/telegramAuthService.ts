import { isSupabaseConfigured, supabase } from '../supabase';
import { IS_WEB } from '../platform/constants';
import { getTelegramWebApp, isTelegramMiniApp } from '../telegram/telegramWebApp';

export type TelegramAuthSessionResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user_id: string;
};

export function canUseTelegramAutoAuth(): boolean {
  return IS_WEB && isTelegramMiniApp() && isSupabaseConfigured;
}

function getInitData(): string | null {
  const initData = getTelegramWebApp()?.initData;
  return initData?.trim() ? initData : null;
}

export async function tryTelegramAutoSignIn(): Promise<boolean> {
  if (!canUseTelegramAutoAuth()) {
    return false;
  }

  const initData = getInitData();
  if (!initData) {
    return false;
  }

  const { data, error } = await supabase.functions.invoke<TelegramAuthSessionResponse>('telegram-auth', {
    body: { initData },
  });

  if (error || !data?.access_token || !data.refresh_token) {
    console.warn('[TelegramAuth] Auto sign-in failed:', error?.message);
    return false;
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });

  if (sessionError) {
    console.warn('[TelegramAuth] Could not restore Telegram session:', sessionError.message);
    return false;
  }

  return true;
}
