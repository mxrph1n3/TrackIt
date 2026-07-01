import type { AnalyticsTabId } from '../types/analytics';

export const ANALYTICS_TABS: Array<{ id: AnalyticsTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'finance', label: 'Finance' },
  { id: 'health', label: 'Health' },
];
