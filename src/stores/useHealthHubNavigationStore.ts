import { create } from 'zustand';

import type { HealthPendingRoute } from '../navigation/healthTypes';

type HealthHubNavigationState = {
  pendingRoute: HealthPendingRoute | null;
  initialHealthTab: 'workouts' | 'nutrition';
  queueRoute: (route: HealthPendingRoute) => void;
  consumePendingRoute: () => HealthPendingRoute | null;
  setInitialHealthTab: (tab: 'workouts' | 'nutrition') => void;
  consumeInitialHealthTab: () => 'workouts' | 'nutrition' | null;
  reset: () => void;
};

export const useHealthHubNavigationStore = create<HealthHubNavigationState>((set, get) => ({
  pendingRoute: null,
  initialHealthTab: 'workouts',

  queueRoute: (route) => set({ pendingRoute: route }),

  consumePendingRoute: () => {
    const route = get().pendingRoute;
    set({ pendingRoute: null });
    return route;
  },

  setInitialHealthTab: (tab) => set({ initialHealthTab: tab }),

  consumeInitialHealthTab: () => {
    const tab = get().initialHealthTab;
    if (tab === 'workouts') {
      return null;
    }

    set({ initialHealthTab: 'workouts' });
    return tab;
  },

  reset: () =>
    set({
      pendingRoute: null,
      initialHealthTab: 'workouts',
    }),
}));
