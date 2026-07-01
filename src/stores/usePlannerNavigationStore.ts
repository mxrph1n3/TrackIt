import { create } from 'zustand';

export type PlannerScreenId = 'main' | 'allTasks';

type TaskCreatorSeed = {
  time?: string;
};

type PlannerNavigationState = {
  screen: PlannerScreenId;
  pendingTaskSeed: TaskCreatorSeed | null;
  openAllTasks: () => void;
  closeAllTasks: () => void;
  openTaskCreator: (seed?: TaskCreatorSeed) => void;
  consumePendingTaskSeed: () => TaskCreatorSeed | null;
};

export const usePlannerNavigationStore = create<PlannerNavigationState>((set, get) => ({
  screen: 'main',
  pendingTaskSeed: null,
  openAllTasks: () => set({ screen: 'allTasks' }),
  closeAllTasks: () => set({ screen: 'main' }),
  openTaskCreator: (seed) =>
    set({
      screen: 'main',
      pendingTaskSeed: seed ?? {},
    }),
  consumePendingTaskSeed: () => {
    const seed = get().pendingTaskSeed;
    set({ pendingTaskSeed: null });
    return seed;
  },
}));
