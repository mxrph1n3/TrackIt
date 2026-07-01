import type { PremiumFeatureId } from '../../types/subscription';

export type PremiumFeatureMeta = {
  title: string;
  description: string;
};

export const PREMIUM_FEATURE_META: Record<PremiumFeatureId, PremiumFeatureMeta> = {
  ai_coach: {
    title: 'AI Coach',
    description: 'Cross-module insights from tasks, workouts, nutrition, finance, and habits.',
  },
  ai_tasks: {
    title: 'AI Task Planning',
    description: 'Break projects into stages and distribute tasks across your week.',
  },
  ai_habits: {
    title: 'AI Habit Analysis',
    description: 'Recommendations, charts, and predictions for your routines.',
  },
  ai_workout: {
    title: 'Workout AI',
    description: 'Personalized programs, auto-progression, and progress analysis.',
  },
  ai_nutrition: {
    title: 'AI Nutrition',
    description: 'Meal plans, macro targets, recipes, and smart food swaps.',
  },
  ai_finance: {
    title: 'AI Finance',
    description: 'Spending analysis, savings tips, and budget forecasts.',
  },
  ai_notes: {
    title: 'AI Notes',
    description: 'Summarize, rewrite, generate, and translate your notes.',
  },
  advanced_analytics: {
    title: 'Advanced Analytics',
    description: 'All-time stats, heatmaps, forecasts, and cross-module comparisons.',
  },
  export: {
    title: 'Data Export',
    description: 'Export your logs to PDF, Excel, or CSV.',
  },
  cloud_sync: {
    title: 'Cloud Sync',
    description: 'Keep every device in sync automatically.',
  },
  cloud_backup: {
    title: 'Cloud Backups',
    description: 'Automatic encrypted backups of your TrackIt data.',
  },
  premium_themes: {
    title: 'Premium Themes',
    description: 'AMOLED Black, Glass, Minimal, Gradient, and Cyber themes.',
  },
  dashboard_customization: {
    title: 'Dashboard Layout',
    description: 'Reorder and customize your dashboard widgets.',
  },
  pro_workout_programs: {
    title: 'Pro Workout Programs',
    description: '100+ goal-based programs for mass, fat loss, strength, home, and gym.',
  },
  custom_workout_programs: {
    title: 'Unlimited Programs',
    description: 'Create as many custom workout programs as you need.',
  },
  custom_exercise_library: {
    title: 'Full Exercise Library',
    description: 'Build a personal library with unlimited custom exercises.',
  },
};

/** Returns true when the feature requires an active Pro subscription. */
export function isPremiumFeature(feature: PremiumFeatureId): boolean {
  return feature in PREMIUM_FEATURE_META;
}
