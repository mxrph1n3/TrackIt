import {
  Calendar,
  CheckSquare,
  Droplets,
  Dumbbell,
  Headphones,
  NotebookPen,
  PiggyBank,
  RefreshCw,
  Scale,
  ScanLine,
  Smile,
  Target,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react-native';

import type { FavoriteAction, QuickAction } from '../types/quickActions';

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'task', label: 'Task', icon: CheckSquare },
  { id: 'habit', label: 'Habit', icon: RefreshCw },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'meal', label: 'Meal', icon: UtensilsCrossed },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'goal', label: 'Goal', icon: Target },
  { id: 'note', label: 'Note', icon: NotebookPen },
  { id: 'savings-goal', label: 'Savings Goal', icon: PiggyBank },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'focus', label: 'Focus', icon: Headphones },
  { id: 'scan', label: 'Scan', icon: ScanLine },
];

export const DEFAULT_FAVORITES: FavoriteAction[] = [
  { id: 'task', label: 'Task' },
  { id: 'finance', label: 'Expense' },
  { id: 'workout', label: 'Workout' },
  { id: 'water', label: 'Water' },
];
