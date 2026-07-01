import {
  ArrowDownCircle,
  ArrowUpCircle,
  Dumbbell,
  ListTree,
  PlusSquare,
  RefreshCw,
  Sparkles,
  Target,
  UtensilsCrossed,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import type { QuickActionId } from '../types/quickActions';

export type RadialHubActionKind = 'form' | 'route' | 'ai-input';

export type RadialHubAction = {
  key: string;
  label: string;
  actionId: QuickActionId;
  icon: LucideIcon;
  accent: string;
  angle: number;
  kind: RadialHubActionKind;
  financePreset?: 'expense' | 'income';
};

/** Nine actions on a wider orbit — 40° spacing from 12 o'clock. */
export const ACTION_HUB_RADIAL_ACTIONS: RadialHubAction[] = [
  { key: 'task', label: 'New Task', actionId: 'task', icon: PlusSquare, accent: '#775DD8', angle: -90, kind: 'form' },
  { key: 'workout', label: 'Workout', actionId: 'workout', icon: Dumbbell, accent: '#775DD8', angle: -50, kind: 'route' },
  { key: 'meal', label: 'Meal', actionId: 'meal', icon: UtensilsCrossed, accent: '#F59E0B', angle: -10, kind: 'form' },
  { key: 'habit', label: 'Habit', actionId: 'habit', icon: RefreshCw, accent: '#6366F1', angle: 30, kind: 'form' },
  { key: 'expense', label: 'Expense', actionId: 'finance', icon: ArrowDownCircle, accent: '#34D399', angle: 70, kind: 'form', financePreset: 'expense' },
  { key: 'income', label: 'Income', actionId: 'finance', icon: ArrowUpCircle, accent: '#059669', angle: 110, kind: 'form', financePreset: 'income' },
  { key: 'goal', label: 'Goal', actionId: 'goal', icon: Target, accent: '#818CF8', angle: 150, kind: 'route' },
  { key: 'ai', label: 'AI Input', actionId: 'task', icon: Sparkles, accent: '#775DD8', angle: 190, kind: 'ai-input' },
  { key: 'subtask', label: 'Subtask', actionId: 'task', icon: ListTree, accent: '#775DD8', angle: 230, kind: 'form' },
];

export type RecentActionEntry = {
  id: string;
  title: string;
  meta: string;
  actionId: QuickActionId;
  icon: LucideIcon;
  accent: string;
};

export function findRadialAction(actionId: QuickActionId, key?: string): RadialHubAction | undefined {
  if (key) {
    return ACTION_HUB_RADIAL_ACTIONS.find((item) => item.key === key);
  }
  return ACTION_HUB_RADIAL_ACTIONS.find((item) => item.actionId === actionId);
}
