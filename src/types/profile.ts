import type { LucideIcon } from 'lucide-react-native';

import type { RootTabParamList } from '../navigation/types';

export type ProfileModuleId =
  | 'dashboard'
  | 'habits'
  | 'focus'
  | 'journal'
  | 'mission'
  | 'quotes'
  | 'analytics'
  | 'finance'
  | 'achievements'
  | 'premium'
  | 'settings';

export type ProfileMenuItem = {
  id: ProfileModuleId;
  label: string;
  icon: LucideIcon;
  tabRoute?: keyof RootTabParamList;
  profileModule?:
    | 'habits'
    | 'focus'
    | 'achievements'
    | 'premium'
    | 'settings'
    | 'finance'
    | 'journal'
    | 'mission'
    | 'quotes';
};

export type LifeOsStats = {
  daysInApp: number;
  activeHabits: number;
  focusHours: number;
};

export type ProfileIdentity = {
  username: string;
  tagline: string;
  level: number;
  avatarInitials: string;
  avatarUrl?: string | null;
};
