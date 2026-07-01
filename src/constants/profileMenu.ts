import {
  BarChart3,
  BookOpen,
  Crown,
  Focus,
  LayoutDashboard,
  Map,
  MessageSquareQuote,
  RefreshCw,
  Settings,
  Trophy,
  Wallet,
} from 'lucide-react-native';

import type { ProfileMenuItem } from '../types/profile';

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tabRoute: 'Dashboard' },
  { id: 'habits', label: 'Habits', icon: RefreshCw, profileModule: 'habits' },
  { id: 'focus', label: 'Focus Mode', icon: Focus, profileModule: 'focus' },
  { id: 'journal', label: 'Journal', icon: BookOpen, profileModule: 'journal' },
  { id: 'mission', label: 'Mission Roadmap', icon: Map, profileModule: 'mission' },
  { id: 'quotes', label: 'Quotes', icon: MessageSquareQuote, profileModule: 'quotes' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, tabRoute: 'Analytics' },
  { id: 'finance', label: 'Finance', icon: Wallet, profileModule: 'finance' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, profileModule: 'achievements' },
  { id: 'premium', label: 'TrackIt Pro', icon: Crown, profileModule: 'premium' },
  { id: 'settings', label: 'Settings', icon: Settings, profileModule: 'settings' },
];
