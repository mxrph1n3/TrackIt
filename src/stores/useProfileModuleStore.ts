import { create } from 'zustand';

import { isAppFullyFree } from '../constants/appAccess';

export type ProfileStackModuleId =
  | 'habits'
  | 'focus'
  | 'achievements'
  | 'premium'
  | 'settings'
  | 'finance'
  | 'journal'
  | 'mission'
  | 'quotes';

type ProfileModuleState = {
  activeModule: ProfileStackModuleId | null;
  openModule: (id: ProfileStackModuleId) => void;
  closeModule: () => void;
};

export const useProfileModuleStore = create<ProfileModuleState>((set) => ({
  activeModule: null,
  openModule: (id) => {
    if (id === 'premium' && isAppFullyFree()) {
      return;
    }
    set({ activeModule: id });
  },
  closeModule: () => set({ activeModule: null }),
}));
