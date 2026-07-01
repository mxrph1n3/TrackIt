import { create } from 'zustand';

type MetricsSyncState = {
  version: number;
  bump: () => void;
};

/** Notifies dashboard/analytics hooks to refresh after a workout is saved. */
export const useMetricsSyncStore = create<MetricsSyncState>((set) => ({
  version: 0,
  bump: () => set((state) => ({ version: state.version + 1 })),
}));
