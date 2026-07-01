import type { LucideIcon } from 'lucide-react-native';

export type QuickActionId =
  | 'task'
  | 'habit'
  | 'workout'
  | 'finance'
  | 'meal'
  | 'weight'
  | 'water'
  | 'mood'
  | 'goal'
  | 'note'
  | 'savings-goal'
  | 'event'
  | 'focus'
  | 'scan';

export type QuickAction = {
  id: QuickActionId;
  label: string;
  icon: LucideIcon;
};

export type CreateHubAction = {
  id: QuickActionId;
  title: string;
  subtitle: string;
  accent: string;
  icon: LucideIcon;
};

export type RecentTemplate = {
  id: string;
  actionId: QuickActionId;
  label: string;
  payload?: Record<string, unknown>;
  usedAt: string;
};

export type QuickInputResult =
  | { kind: 'task'; title: string; scheduledTime?: string; isToday: boolean }
  | { kind: 'finance'; type: 'expense' | 'income'; amount: number; label: string }
  | { kind: 'meal'; mealName: string; calories?: number }
  | { kind: 'workout'; exercise: string; weight?: number; reps?: number }
  | { kind: 'unknown' };

export type FavoriteAction = {
  id: QuickActionId;
  label: string;
};

export type ContextChip = {
  id: string;
  label: string;
  actionId: QuickActionId;
};

export type AiRecommendation = {
  id: string;
  label: string;
  actionId: QuickActionId;
};
