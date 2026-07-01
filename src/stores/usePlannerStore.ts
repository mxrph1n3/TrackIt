import { create } from 'zustand';

import { toDayKey } from '../utils/plannerDates';
import type { PlannerTaskItem } from '../types/planner';

type PlannerState = {
  isTaskSheetOpen: boolean;
  taskSheetDayKey: string;
  openTaskSheet: (dayKey?: string) => void;
  closeTaskSheet: () => void;
};

export const usePlannerStore = create<PlannerState>((set) => ({
  isTaskSheetOpen: false,
  taskSheetDayKey: toDayKey(new Date()),
  openTaskSheet: (dayKey) =>
    set({
      isTaskSheetOpen: true,
      taskSheetDayKey: dayKey ?? toDayKey(new Date()),
    }),
  closeTaskSheet: () => set({ isTaskSheetOpen: false }),
}));

export type { PlannerTaskItem };
