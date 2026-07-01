export type UserAchievementRow = {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  unlocked_at: string | null;
  xp_collected: boolean;
  created_at: string;
  updated_at: string;
};

export type FocusSessionRow = {
  id: string;
  user_id: string;
  session_type: 'focus' | 'short_break' | 'long_break';
  duration_seconds: number;
  completed_at: string;
  created_at: string;
};
