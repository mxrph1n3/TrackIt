import { getDashboardTierTheme } from './dashboard/tierTheme';
import type {
  CurrentUserLeaderboard,
  LeaderboardEntry,
  LeaderboardState,
  ProfileRow,
  ProfileStatsUpdate,
} from '../types/database';

const TOP_LIMIT = 50;

function mapLeaderboardEntry(row: Record<string, unknown>, rankOverride?: number): LeaderboardEntry {
  const level = Number(row.level);
  const tierFromDb = row.performance_tier ? String(row.performance_tier) : null;

  return {
    id: String(row.id),
    username: String(row.username),
    level,
    xp: Number(row.xp),
    days_active: Number(row.days_active),
    focus_hours: Number(row.focus_hours),
    habits_count: Number(row.habits_count),
    rank_position: rankOverride ?? Number(row.rank_position),
    performance_tier: tierFromDb ?? getDashboardTierTheme(level).code,
    performance_tier_label: String(
      row.performance_tier_label ?? getDashboardTierTheme(level).label,
    ),
  };
}

function mapProfileRow(row: Record<string, unknown>): ProfileRow {
  return {
    id: String(row.id),
    username: String(row.username),
    level: Number(row.level),
    xp: Number(row.xp),
    days_active: Number(row.days_active),
    focus_hours: Number(row.focus_hours),
    habits_count: Number(row.habits_count),
    age: row.age == null ? null : Number(row.age),
    gender:
      row.gender === 'male' || row.gender === 'female' || row.gender === 'other'
        ? row.gender
        : null,
    height_cm: row.height_cm == null ? null : Number(row.height_cm),
    activity_factor: row.activity_factor == null ? null : Number(row.activity_factor),
    diet_goal:
      row.diet_goal === 'fat_loss' || row.diet_goal === 'maintenance' || row.diet_goal === 'bulk'
        ? row.diet_goal
        : null,
    goal_pace_kg: row.goal_pace_kg == null ? null : Number(row.goal_pace_kg),
    updated_at: String(row.updated_at),
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while loading the leaderboard.';
}

export { mapLeaderboardEntry, mapProfileRow, toErrorMessage, TOP_LIMIT };
export type {
  CurrentUserLeaderboard,
  LeaderboardEntry,
  LeaderboardState,
  ProfileRow,
  ProfileStatsUpdate,
};
