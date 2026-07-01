import type { LeaderboardEntry, ProfileRow } from './database';

export type XpProgress = {
  currentXp: number;
  requiredXp: number;
  percent: number;
};

export type GlobalRankSnapshot = {
  rankPosition: number;
  totalUsers: number;
  percentile: number;
  performanceTier: string;
  tierLabel: string;
};

export type GamificationLeaderboardResult = {
  topUsers: LeaderboardEntry[];
  currentUserRank: GlobalRankSnapshot | null;
};

export type LevelUpCelebration = {
  newLevel: number;
  actionName: string;
};

export type GamificationSnapshot = {
  profile: ProfileRow | null;
  level: number;
  xp: number;
  xpProgress: XpProgress;
  globalRank: GlobalRankSnapshot | null;
};

export type AddXpActionResult = {
  leveledUp: boolean;
  newLevel: number;
  newXp: number;
  actionName: string;
};
