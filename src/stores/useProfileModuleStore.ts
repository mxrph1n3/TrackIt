import { create } from 'zustand';

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
  openModule: (id) => set({ activeModule: id }),
  closeModule: () => set({ activeModule: null }),
}));
