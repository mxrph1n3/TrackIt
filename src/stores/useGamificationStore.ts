import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

import { isFinanceVulnerableDebuffAction } from '../lib/finance/gamification';
import {
  awardXpAndCheckLevel,
  buildGamificationSnapshot,
  fetchCurrentProfile,
  fetchGlobalLeaderboard,
  resolveGlobalRank,
  toErrorMessage,
} from '../lib/gamification/service';
import { updateProfileUsername } from '../lib/profile/service';
import { validateUsername } from '../lib/profile/usernameValidation';
import { getXpRequiredForLevel } from '../lib/gamification/progression';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { LeaderboardEntry, ProfileRow } from '../types/database';
import type {
  GamificationLeaderboardResult,
  GlobalRankSnapshot,
  LevelUpCelebration,
  XpProgress,
} from '../types/gamification';

type GamificationState = {
  profile: ProfileRow | null;
  level: number;
  xp: number;
  xpProgress: XpProgress;
  globalRank: GlobalRankSnapshot | null;
  topUsers: LeaderboardEntry[];
  isLoading: boolean;
  isAwardingXp: boolean;
  isUpdatingUsername: boolean;
  error: string | null;
  levelUpCelebration: LevelUpCelebration | null;
  isInitialized: boolean;
  financeXpMultiplier: number;

  initialize: () => Promise<void>;
  syncProfile: () => Promise<void>;
  fetchGlobalLeaderboard: () => Promise<GamificationLeaderboardResult>;
  addXpAction: (amount: number, actionName: string) => Promise<boolean>;
  setFinanceXpMultiplier: (multiplier: number) => void;
  updateUsername: (newUsername: string) => Promise<{ success: boolean; error: string | null }>;
  dismissLevelUp: () => void;
  teardown: () => void;
};

let realtimeChannel: RealtimeChannel | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

const INITIAL_XP_PROGRESS = {
  currentXp: 0,
  requiredXp: getXpRequiredForLevel(1),
  percent: 0,
};

async function loadGamificationState(
  userId: string | null,
  options?: { includeRank?: boolean },
) {
  if (!userId) {
    return buildGamificationSnapshot(null, null);
  }

  const profile = await fetchCurrentProfile(userId);
  if (!profile) {
    return buildGamificationSnapshot(null, null);
  }

  if (options?.includeRank === false) {
    return buildGamificationSnapshot(profile, null);
  }

  const globalRank = await resolveGlobalRank(profile);
  return buildGamificationSnapshot(profile, globalRank);
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  profile: null,
  level: 1,
  xp: 0,
  xpProgress: INITIAL_XP_PROGRESS,
  globalRank: null,
  topUsers: [],
  isLoading: false,
  isAwardingXp: false,
  isUpdatingUsername: false,
  error: null,
  levelUpCelebration: null,
  isInitialized: false,
  financeXpMultiplier: 1,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({
        isLoading: false,
        isInitialized: true,
        error:
          'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const snapshot = await loadGamificationState(session?.user?.id ?? null, {
        includeRank: false,
      });

      set({
        ...snapshot,
        topUsers: get().topUsers,
        isLoading: false,
        isInitialized: true,
        error: null,
      });

      if (snapshot.profile) {
        void resolveGlobalRank(snapshot.profile)
          .then((globalRank) => {
            set({ globalRank });
          })
          .catch(() => {
            /* rank is non-blocking */
          });
      }

      if (!realtimeChannel) {
        realtimeChannel = supabase
          .channel('gamification-live')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            () => {
              void get().syncProfile();
            },
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks' },
            () => {
              void get().syncProfile();
            },
          )
          .subscribe();
      }

      if (!authSubscription) {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(() => {
          void get().syncProfile();
        });
        authSubscription = subscription;
      }
    } catch (error) {
      set({
        isLoading: false,
        isInitialized: true,
        error: toErrorMessage(error),
      });
    }
  },

  syncProfile: async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const snapshot = await loadGamificationState(session?.user?.id ?? null, {
        includeRank: false,
      });

      set({
        ...snapshot,
        error: null,
      });

      if (snapshot.profile) {
        void resolveGlobalRank(snapshot.profile)
          .then((globalRank) => {
            set({ globalRank });
          })
          .catch(() => {
            /* rank is non-blocking */
          });
      }
    } catch (error) {
      set({ error: toErrorMessage(error) });
    }
  },

  fetchGlobalLeaderboard: async () => {
    if (!isSupabaseConfigured) {
      const empty = { topUsers: [], currentUserRank: null };
      set({ topUsers: [], globalRank: null });
      return empty;
    }

    set({ isLoading: true, error: null });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id ?? null;
      const result = await fetchGlobalLeaderboard(userId);

      set({
        topUsers: result.topUsers,
        globalRank: result.currentUserRank,
        isLoading: false,
        error: null,
      });

      return result;
    } catch (error) {
      set({
        isLoading: false,
        error: toErrorMessage(error),
      });
      throw error;
    }
  },

  addXpAction: async (amount, actionName) => {
    if (!isSupabaseConfigured) {
      set({
        error:
          'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      });
      return false;
    }

    set({ isAwardingXp: true, error: null });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) {
        throw new Error('You must be signed in to earn XP.');
      }

      const { financeXpMultiplier } = get();
      let finalAmount = amount;
      if (isFinanceVulnerableDebuffAction(actionName) && financeXpMultiplier < 1) {
        finalAmount = Math.max(1, Math.round(amount * financeXpMultiplier));
      }

      const result = await awardXpAndCheckLevel(userId, finalAmount, actionName);
      await get().syncProfile();

      if (result.leveledUp) {
        set({
          levelUpCelebration: {
            newLevel: result.newLevel,
            actionName: result.actionName,
          },
        });
      }

      return result.leveledUp;
    } catch (error) {
      set({ error: toErrorMessage(error) });
      return false;
    } finally {
      set({ isAwardingXp: false });
    }
  },

  updateUsername: async (newUsername) => {
    const validation = validateUsername(newUsername);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!isSupabaseConfigured) {
      return {
        success: false,
        error:
          'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }

    set({ isUpdatingUsername: true });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) {
        return { success: false, error: 'You must be signed in to update your username.' };
      }

      const result = await updateProfileUsername(userId, validation.normalized);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const currentProfile = get().profile;
      if (currentProfile && result.username) {
        set({
          profile: { ...currentProfile, username: result.username },
        });
      }

      await get().syncProfile();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: toErrorMessage(error) };
    } finally {
      set({ isUpdatingUsername: false });
    }
  },

  dismissLevelUp: () => {
    set({ levelUpCelebration: null });
  },

  setFinanceXpMultiplier: (multiplier) => {
    set({ financeXpMultiplier: multiplier });
  },

  teardown: () => {
    if (realtimeChannel) {
      void supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }
  },
}));
