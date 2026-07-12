import { isSupabaseConfigured, supabase } from '../supabase';
import { getTelegramWebApp, isTelegramMiniApp } from '../telegram/telegramWebApp';
import { IS_WEB } from '../platform/constants';
import type { TmaAccessStatus } from '../../types/tmaAccess';
import { EMPTY_TMA_ACCESS } from '../../types/tmaAccess';

export function canSyncTmaAccess(): boolean {
  return IS_WEB && isTelegramMiniApp() && isSupabaseConfigured;
}

function getInitData(): string | null {
  const initData = getTelegramWebApp()?.initData;
  return initData?.trim() ? initData : null;
}

export async function syncTmaAccess(): Promise<TmaAccessStatus> {
  if (!canSyncTmaAccess()) {
    return EMPTY_TMA_ACCESS;
  }

  const initData = getInitData();
  if (!initData) {
    return EMPTY_TMA_ACCESS;
  }

  const { data, error } = await supabase.functions.invoke<TmaAccessStatus>('tma-access', {
    body: { initData },
  });

  if (error || !data) {
    console.warn('[TMA] Access sync failed:', error?.message);
    return EMPTY_TMA_ACCESS;
  }

  return data;
}

export async function createTelegramStarsInvoice(): Promise<string> {
  const initData = getInitData();
  if (!initData) {
    throw new Error('Telegram session is not available.');
  }

  const { data, error } = await supabase.functions.invoke<{ invoiceUrl: string }>(
    'telegram-create-invoice',
    { body: { initData } },
  );

  if (error || !data?.invoiceUrl) {
    throw new Error(error?.message ?? 'Could not create Stars invoice.');
  }

  return data.invoiceUrl;
}

export async function setTelegramRemindersEnabled(enabled: boolean): Promise<void> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) {
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ telegram_reminders_enabled: enabled })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}
