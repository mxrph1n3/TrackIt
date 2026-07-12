import { isSupabaseConfigured, supabase } from '../supabase';

type SyncSubscriptionResponse = {
  isPro: boolean;
  synced: boolean;
  expiresAt?: string | null;
};

/** Sync RevenueCat entitlement to server-side profiles.is_pro (service role write). */
export async function syncProStatusToServer(): Promise<SyncSubscriptionResponse | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke<SyncSubscriptionResponse>(
    'sync-subscription-status',
    { body: {} },
  );

  if (error) {
    console.warn('[Subscription] Server Pro sync failed:', error.message);
    return null;
  }

  return data ?? null;
}
