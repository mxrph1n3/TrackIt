import { create } from 'zustand';

import type { QuickActionId } from '../types/quickActions';

type CreateHubOpenOptions = {
  financePreset?: 'income' | 'expense';
};

type CreateHubState = {
  isOpen: boolean;
  initialAction: QuickActionId | null;
  financePreset: 'income' | 'expense' | null;
  open: (actionId?: QuickActionId, options?: CreateHubOpenOptions) => void;
  close: () => void;
};

export const useCreateHubStore = create<CreateHubState>((set) => ({
  isOpen: false,
  initialAction: null,
  financePreset: null,
  open: (actionId, options) =>
    set({
      isOpen: true,
      initialAction: actionId ?? null,
      financePreset: options?.financePreset ?? null,
    }),
  close: () => set({ isOpen: false, initialAction: null, financePreset: null }),
}));
