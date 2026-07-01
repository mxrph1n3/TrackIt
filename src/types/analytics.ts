export type AnalyticsTabId = 'overview' | 'productivity' | 'finance' | 'health';

export type LifeAttribute = {
  id: string;
  label: string;
  value: number;
};

export type ExpenseSlice = {
  id: string;
  label: string;
  percentage: number;
  color: string;
};

export type HealthTrendPoint = {
  day: string;
  calories: number;
  weight: number;
};

export type TaskCompletionPoint = {
  day: string;
  percent: number;
};
