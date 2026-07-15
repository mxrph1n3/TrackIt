import type { PremiumFeatureId } from '../../types/subscription';

export type PremiumFeatureMeta = {
  title: string;
  description: string;
};

export const PREMIUM_FEATURE_META: Record<PremiumFeatureId, PremiumFeatureMeta> = {
  ai_tasks: {
    title: 'Smart Task Planning',
    description: 'Break projects into stages and distribute tasks across your week.',
  },
  ai_habits: {
    title: 'Habit Insights',
    description: 'Recommendations, charts, and trends for your routines.',
  },
  ai_workout: {
    title: 'Workout Insights',
    description: 'Structured programs, auto-progression, and progress analysis.',
  },
  ai_nutrition: {
    title: 'Nutrition Planning',
    description: 'Meal targets, macro breakdowns, and smart food swaps.',
  },
  ai_finance: {
    title: 'Finance Insights',
    description: 'Spending analysis, savings tips, and budget overviews.',
  },
  ai_notes: {
    title: 'Smart Notes',
    description: 'Organize, structure, and review your notes.',
  },
  advanced_analytics: {
    title: 'Advanced Analytics',
    description: 'All-time stats, heatmaps, forecasts, and cross-module comparisons.',
  },
  cloud_sync: {
    title: 'Cloud Sync',
    description: 'Keep every device in sync automatically.',
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
    description: 'Additional goal-based programs for mass, fat loss, strength, home, and gym.',
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
