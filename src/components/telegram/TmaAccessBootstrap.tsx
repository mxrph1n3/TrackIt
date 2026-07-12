import { useEffect } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { canSyncTmaAccess } from '../../lib/subscription/tmaAccessService';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';

/** Starts TMA trial and refreshes access status inside Telegram Mini App. */
export function TmaAccessBootstrap() {
  const user = useAuth().user;
  const syncTma = useSubscriptionStore((s) => s.syncTma);

  useEffect(() => {
    if (!user?.id || !canSyncTmaAccess()) {
      return;
    }

    void syncTma();
  }, [syncTma, user?.id]);

  useEffect(() => {
    if (!user?.id || !canSyncTmaAccess()) {
      return;
    }

    const intervalId = globalThis.setInterval(() => {
      void syncTma();
    }, 60_000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [syncTma, user?.id]);

  return null;
}
