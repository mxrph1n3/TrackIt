import type { TrackItIconName } from './trackItIcons';

export type AchievementMetricKey =
  | 'tasks_completed'
  | 'habit_streak_days'
  | 'focus_sessions'
  | 'level_reached';

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  icon: TrackItIconName;
  xpReward: number;
  targetValue: number;
  metricKey: AchievementMetricKey;
  titleReward?: string;
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Complete your first task.',
    icon: 'swords',
    xpReward: 100,
    targetValue: 1,
    metricKey: 'tasks_completed',
    titleReward: 'Initiate',
  },
  {
    id: 'task_grinder',
    title: 'Task Grinder',
    description: 'Complete 50 tasks.',
    icon: 'swords',
    xpReward: 100,
    targetValue: 50,
    metricKey: 'tasks_completed',
    titleReward: 'Operator',
  },
  {
    id: 'iron_discipline',
    title: 'Titan Discipline',
    description: 'Maintain a 7-day habit streak.',
    icon: 'flame',
    xpReward: 100,
    targetValue: 7,
    metricKey: 'habit_streak_days',
    titleReward: 'Disciple',
  },
  {
    id: 'deep_focus',
    title: 'Deep Focus',
    description: 'Complete 5 focus sessions.',
    icon: 'gem',
    xpReward: 100,
    targetValue: 5,
    metricKey: 'focus_sessions',
  },
  {
    id: 'level_climber',
    title: 'Level Climber',
    description: 'Reach level 10.',
    icon: 'mountain',
    xpReward: 150,
    targetValue: 10,
    metricKey: 'level_reached',
    titleReward: 'Ascendant',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 tasks.',
    icon: 'shield',
    xpReward: 200,
    targetValue: 100,
    metricKey: 'tasks_completed',
    titleReward: 'Centurion',
  },
];
