import {
  FREE_ANALYTICS_DAYS,
  FREE_ANALYTICS_HEATMAP_WEEKS,
  PRO_ANALYTICS_HEATMAP_WEEKS,
} from '../../constants/workoutFreeTier';

export function getAnalyticsBarChartDays(isPro: boolean): number {
  return isPro ? 14 : FREE_ANALYTICS_DAYS;
}

export function getAnalyticsHeatmapWeeks(isPro: boolean): number {
  return isPro ? PRO_ANALYTICS_HEATMAP_WEEKS : FREE_ANALYTICS_HEATMAP_WEEKS;
}
