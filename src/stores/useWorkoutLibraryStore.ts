import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  canAddCustomExercise,
  canCreateCustomProgram,
  type WorkoutGateReason,
} from '../lib/subscription/workoutGating';
import { selectIsPro, useSubscriptionStore } from './useSubscriptionStore';

const STORAGE_KEY = '@trackit/workout_library_v1';

export type CustomExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  createdAt: string;
};

export type CustomWorkoutProgram = {
  id: string;
  title: string;
  description: string;
  exerciseIds: string[];
  createdAt: string;
};

type WorkoutLibraryState = {
  isHydrated: boolean;
  customExercises: CustomExercise[];
  customPrograms: CustomWorkoutProgram[];
  hydrate: () => Promise<void>;
  addCustomExercise: (
    input: Omit<CustomExercise, 'id' | 'createdAt'>,
    isPro: boolean,
  ) => { ok: true; exercise: CustomExercise } | { ok: false; reason: WorkoutGateReason };
  addCustomProgram: (
    input: Omit<CustomWorkoutProgram, 'id' | 'createdAt'>,
    isPro: boolean,
  ) => { ok: true; program: CustomWorkoutProgram } | { ok: false; reason: WorkoutGateReason };
};

async function persist(state: Pick<WorkoutLibraryState, 'customExercises' | 'customPrograms'>) {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      customExercises: state.customExercises,
      customPrograms: state.customPrograms,
    }),
  );
}

export const useWorkoutLibraryStore = create<WorkoutLibraryState>((set, get) => ({
  isHydrated: false,
  customExercises: [],
  customPrograms: [],

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          customExercises?: CustomExercise[];
          customPrograms?: CustomWorkoutProgram[];
        };
        set({
          customExercises: parsed.customExercises ?? [],
          customPrograms: parsed.customPrograms ?? [],
          isHydrated: true,
        });
        return;
      }
    } catch (error) {
      console.warn('[WorkoutLibraryStore] hydrate failed:', error);
    }
    set({ isHydrated: true });
  },

  addCustomExercise: (input, isPro) => {
    const { customExercises } = get();
    if (!canAddCustomExercise(customExercises.length, isPro)) {
      return { ok: false, reason: 'custom_exercise_limit' };
    }

    const exercise: CustomExercise = {
      ...input,
      id: `ex_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const nextExercises = [...customExercises, exercise];
    set({ customExercises: nextExercises });
    void persist({ customExercises: nextExercises, customPrograms: get().customPrograms });
    return { ok: true, exercise };
  },

  addCustomProgram: (input, isPro) => {
    const { customPrograms } = get();
    if (!canCreateCustomProgram(customPrograms.length, isPro)) {
      return { ok: false, reason: 'custom_program_limit' };
    }

    const program: CustomWorkoutProgram = {
      ...input,
      id: `prog_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const nextPrograms = [...customPrograms, program];
    set({ customPrograms: nextPrograms });
    void persist({ customExercises: get().customExercises, customPrograms: nextPrograms });
    return { ok: true, program };
  },
}));

export function useWorkoutLibraryCounts() {
  const customExercises = useWorkoutLibraryStore((s) => s.customExercises);
  const customPrograms = useWorkoutLibraryStore((s) => s.customPrograms);
  return {
    customExerciseCount: customExercises.length,
    customProgramCount: customPrograms.length,
  };
}

export function useWorkoutLibraryLimits() {
  const isPro = useSubscriptionStore(selectIsPro);
  const { customExerciseCount, customProgramCount } = useWorkoutLibraryCounts();

  return {
    isPro,
    customExerciseCount,
    customProgramCount,
    canAddProgram: canCreateCustomProgram(customProgramCount, isPro),
    canAddExercise: canAddCustomExercise(customExerciseCount, isPro),
    remainingPrograms: isPro
      ? null
      : Math.max(0, 2 - customProgramCount),
    remainingExercises: isPro
      ? null
      : Math.max(0, 10 - customExerciseCount),
  };
}
