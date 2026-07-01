import {
  CheckSquare,
  Dumbbell,
  NotebookPen,
  RefreshCw,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react-native';

import type { CreateHubAction, QuickActionId } from '../types/quickActions';

/** Six primary create actions — petal layout in Action Hub. */
export const PRIMARY_CREATE_ACTIONS: CreateHubAction[] = [
  {
    id: 'task',
    title: 'New Task',
    subtitle: 'Create task',
    accent: '#775DD8',
    icon: CheckSquare,
  },
  {
    id: 'workout',
    title: 'Workout',
    subtitle: 'Start or continue',
    accent: '#775DD8',
    icon: Dumbbell,
  },
  {
    id: 'finance',
    title: 'Finance',
    subtitle: 'Income / expense',
    accent: '#34D399',
    icon: Wallet,
  },
  {
    id: 'meal',
    title: 'Meals',
    subtitle: 'Add meal',
    accent: '#F59E0B',
    icon: UtensilsCrossed,
  },
  {
    id: 'habit',
    title: 'Habit',
    subtitle: 'Daily discipline',
    accent: '#6366F1',
    icon: RefreshCw,
  },
  {
    id: 'note',
    title: 'Notes',
    subtitle: 'Quick note',
    accent: '#818CF8',
    icon: NotebookPen,
  },
];

/** Petal slot order for radial Action Hub layout. */
export const ACTION_HUB_PETAL_ORDER: QuickActionId[] = [
  'task',
  'workout',
  'finance',
  'meal',
  'habit',
  'note',
];

export const FORM_ACTION_IDS = new Set<QuickActionId>([
  'task',
  'habit',
  'finance',
  'meal',
  'note',
  'water',
  'weight',
  'mood',
]);

export const RECENT_TEMPLATES_KEY = '@trackit/recent_create_templates';

export const QUICK_INPUT_PLACEHOLDER =
  'Buy milk tomorrow at 6pm · Expense 12 Coffee · Breakfast oatmeal';
