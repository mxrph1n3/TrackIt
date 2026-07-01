import type { AiRecommendation, ContextChip } from '../types/quickActions';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export function getDayPeriod(date = new Date()): DayPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  }

  if (hour >= 12 && hour < 18) {
    return 'afternoon';
  }

  return 'evening';
}

export function getContextualChips(period: DayPeriod): ContextChip[] {
  switch (period) {
    case 'morning':
      return [
        { id: 'morning-meal', label: 'Add breakfast', actionId: 'meal' },
        { id: 'morning-water', label: 'Log water', actionId: 'water' },
        { id: 'morning-task', label: 'Create task', actionId: 'task' },
      ];
    case 'afternoon':
      return [
        { id: 'afternoon-task', label: 'Create task', actionId: 'task' },
        { id: 'afternoon-workout', label: 'Start workout', actionId: 'workout' },
        { id: 'afternoon-finance', label: 'Add expense', actionId: 'finance' },
      ];
    case 'evening':
      return [
        { id: 'evening-meal', label: 'Log dinner', actionId: 'meal' },
        { id: 'evening-habit', label: 'Check habit', actionId: 'habit' },
        { id: 'evening-note', label: 'Quick note', actionId: 'note' },
      ];
  }
}

export function getAiRecommendations(period: DayPeriod): AiRecommendation[] {
  if (period === 'morning') {
    return [
      { id: 'ai-meal', label: 'Add breakfast', actionId: 'meal' },
      { id: 'ai-task', label: 'Create task', actionId: 'task' },
    ];
  }

  if (period === 'evening') {
    return [
      { id: 'ai-meal', label: 'Log dinner', actionId: 'meal' },
      { id: 'ai-habit', label: 'Check habit', actionId: 'habit' },
    ];
  }

  return [
    { id: 'ai-workout', label: 'Start workout', actionId: 'workout' },
    { id: 'ai-finance', label: 'Add income', actionId: 'finance' },
  ];
}
