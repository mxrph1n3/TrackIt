import { useEffect } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useWorkoutLibraryStore } from '../../stores/useWorkoutLibraryStore';

/** Loads RevenueCat customer info and local workout library when the user changes. */
export function SubscriptionBootstrap() {
  const user = useAuth().user;
  const initialize = useSubscriptionStore((s) => s.initialize);
  const hydrateWorkoutLibrary = useWorkoutLibraryStore((s) => s.hydrate);

  useEffect(() => {
    void initialize(user?.id ?? null);
    void hydrateWorkoutLibrary();
  }, [hydrateWorkoutLibrary, initialize, user?.id]);

  return null;
}
