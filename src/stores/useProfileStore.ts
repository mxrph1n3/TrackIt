import { create } from 'zustand';

import type { LifeOsStats, ProfileIdentity, ProfileModuleId } from '../types/profile';

type ProfileState = {
  identity: ProfileIdentity;
  stats: LifeOsStats;
  uncollectedXpRewards: number;
  activeModuleId: ProfileModuleId | null;

  setActiveModule: (id: ProfileModuleId) => void;
  setUncollectedXpRewards: (amount: number) => void;
  collectXpRewards: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  identity: {
    username: 'HUNTER',
    tagline: 'FOCUS • DISCIPLINE • FREEDOM',
    level: 1,
    avatarInitials: 'Z',
  },
  stats: {
    daysInApp: 0,
    activeHabits: 0,
    focusHours: 0,
  },
  uncollectedXpRewards: 0,
  activeModuleId: 'dashboard',

  setActiveModule: (id) => set({ activeModuleId: id }),
  setUncollectedXpRewards: (amount) => set({ uncollectedXpRewards: amount }),
  collectXpRewards: () => set({ uncollectedXpRewards: 0 }),
}));
