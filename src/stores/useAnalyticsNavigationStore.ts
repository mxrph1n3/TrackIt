import { create } from 'zustand';

export type AnalyticsScreen = 'main' | 'leaderboard';

type AnalyticsNavigationState = {
  screen: AnalyticsScreen;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
};

export const useAnalyticsNavigationStore = create<AnalyticsNavigationState>((set) => ({
  screen: 'main',
  openLeaderboard: () => set({ screen: 'leaderboard' }),
  closeLeaderboard: () => set({ screen: 'main' }),
}));
