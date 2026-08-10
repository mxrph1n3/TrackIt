import { isSupabaseConfigured, supabase } from '../supabase';

type SyncSubscriptionResponse = {
  isPro: boolean;
  synced: boolean;
  expiresAt?: string | null;
};

type ClientProSnapshot = {
  isPro: boolean;
  expiresAt?: string | null;
};

/**
 * Sync store Pro status to profiles.is_pro.
 * Pass a client snapshot after native purchase/restore; without body the server
 * returns the current profile flag (synced from native store IAP).
 */
export async function syncProStatusToServer(
  snapshot?: ClientProSnapshot,
): Promise<SyncSubscriptionResponse | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke<SyncSubscriptionResponse>(
    'sync-subscription-status',
    { body: snapshot ?? {} },
  );

  if (error) {
    console.warn('[Subscription] Server Pro sync failed:', error.message);
    return null;
  }

  return data ?? null;
}
