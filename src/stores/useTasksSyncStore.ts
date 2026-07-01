import { create } from 'zustand';

type TasksSyncState = {
  version: number;
  notifyTaskMutation: () => void;
};

/** Bumps a version counter so Dashboard and Planner refresh task caches together. */
export const useTasksSyncStore = create<TasksSyncState>((set) => ({
  version: 0,
  notifyTaskMutation: () => set((state) => ({ version: state.version + 1 })),
}));
