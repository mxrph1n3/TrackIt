export type MissionMilestoneId =
  | 'discipline_foundation'
  | 'consistency_builder'
  | 'mindset_upgrade'
  | 'legacy_creator';

export type MissionMilestoneStatus = 'completed' | 'active' | 'locked';

export type MissionMilestoneDefinition = {
  id: MissionMilestoneId;
  title: string;
  subtitle: string;
  order: number;
};

export const MISSION_MILESTONES: MissionMilestoneDefinition[] = [
  {
    id: 'discipline_foundation',
    title: 'Discipline Foundation',
    subtitle: 'Establish core habits and daily structure.',
    order: 1,
  },
  {
    id: 'consistency_builder',
    title: 'Consistency Builder',
    subtitle: 'Hold a 14-day streak on any active habit.',
    order: 2,
  },
  {
    id: 'mindset_upgrade',
    title: 'Mindset Upgrade',
    subtitle: 'Log 50 hours of focus in a single month.',
    order: 3,
  },
  {
    id: 'legacy_creator',
    title: 'Legacy Creator',
    subtitle: 'Automate nutrition, finance, and peak performance.',
    order: 4,
  },
];

export const MISSION_DAILY_REMINDER =
  'Do not stop when you are tired. Stop when you are done.';
