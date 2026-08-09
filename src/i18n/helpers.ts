import type { TFunction } from 'i18next';

import type { FinanceTip } from '../types/finance';
import type { ProgramExerciseTemplate } from '../types/workout';

/** Translate finance category id → localized label. */
export function tFinanceCategory(t: TFunction, id: string, fallback?: string): string {
  const key = `finance.categories.${id}`;
  const translated = t(key);
  if (translated === key) {
    return fallback ?? id.replace(/_/g, ' ');
  }
  return translated;
}

/** Format a structured finance tip for display. */
export function formatFinanceTip(t: TFunction, tip: FinanceTip): string {
  switch (tip.id) {
    case 'overspending':
      return t('finance.tips.overspending');
    case 'top_category':
      return t('finance.tips.topCategory', {
        category: tFinanceCategory(t, tip.categoryId),
        percentage: tip.percentage,
      });
    case 'goal_pace':
      return t('finance.tips.goalPace', { name: tip.goalName, months: tip.months });
    case 'log_to_unlock':
      return t('finance.tips.logToUnlock');
    case 'first_transaction':
      return t('finance.tips.firstTransaction');
    default:
      return t('finance.tips.logToUnlock');
  }
}

/** Translate action hub radial key → localized label. */
export function tActionHubLabel(t: TFunction, key: string, fallback: string): string {
  const i18nKey = `actionHub.actions.${key}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate achievement field (title / description / titleReward). */
export function tAchievementField(
  t: TFunction,
  id: string,
  field: 'title' | 'description' | 'titleReward',
  fallback: string,
): string {
  const i18nKey = `achievements.items.${id}.${field}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate mission milestone title or subtitle. */
export function tMissionField(
  t: TFunction,
  id: string,
  field: 'title' | 'subtitle',
  fallback: string,
): string {
  const i18nKey = `mission.items.${id}.${field}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate workout program title or description by track id. */
export function tWorkoutProgramField(
  t: TFunction,
  id: string,
  field: 'title' | 'description',
  fallback: string,
): string {
  const i18nKey = `health.programs.${id}.${field}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate a program day focus label by week + day number. */
export function tWorkoutProgramDay(
  t: TFunction,
  programId: string,
  weekNumber: number,
  dayNumber: number,
  fallback: string,
): string {
  const i18nKey = `health.programs.${programId}.days.${weekNumber}-${dayNumber}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate weekday short key (mon…sun / sun…sat). */
export function tWeekdayShort(t: TFunction, key: string, fallback?: string): string {
  const normalized = key.toLowerCase();
  const i18nKey = `common.weekdaysShort.${normalized}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? (fallback ?? key) : translated;
}

/** Translate heart-rate zone display name by zone number. */
export function tHeartRateZoneName(t: TFunction, zone: number, fallback: string): string {
  const i18nKey = `health.hrZones.${zone}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate quote body by quote id. */
export function tQuoteContent(t: TFunction, id: string, fallback: string): string {
  const i18nKey = `quotes.content.${id}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Translate quote author — Unknown / TrackIt via keys; keep famous names as-is. */
export function tQuoteAuthor(t: TFunction, author: string): string {
  const normalized = author.trim().toLowerCase();
  if (normalized === 'unknown') {
    return t('quotes.authors.unknown');
  }
  if (normalized === 'trackit') {
    return t('quotes.authors.trackit');
  }
  return author;
}

/** Translate catalog meal name by meal_id. */
export function tMealName(t: TFunction, mealId: string, fallback: string): string {
  const i18nKey = `nutrition.mealNames.${mealId}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? fallback : translated;
}

/** Slugify an English exercise / note label for `health.exerciseNames.*` keys. */
export function exerciseNameToKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/°/g, 'deg')
    .replace(/%/g, 'pct')
    .replace(/\//g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Translate catalog exercise name by English id / display name. */
export function tExerciseName(t: TFunction, id: string, fallback?: string): string {
  const slug = id.includes(' ') || id.includes('—') || /[A-Z]/.test(id) ? exerciseNameToKey(id) : id;
  const i18nKey = `health.exerciseNames.${slug}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? (fallback ?? id) : translated;
}

const PROGRAM_NOTE_KEYS: Record<string, string> = {
  'Use weight around 70% of your one-rep max.': 'use_weight_70pct_1rm',
  'Rest between sets: 90–120 seconds.': 'rest_90_120',
  'If you experience significant muscle soreness, postpone the workout and allow muscles to recover.':
    'postpone_soreness',
  'Heart rate during warm-up and cool-down — zones 1 and 2.': 'hr_warmup_cooldown',
  'Max HR formula: 220 − age (M) / 226 − age (F).': 'max_hr_formula',
};

/** Translate a program day note stored in English. */
export function tProgramNote(t: TFunction, note: string): string {
  const noteKey = PROGRAM_NOTE_KEYS[note] ?? exerciseNameToKey(note);
  const i18nKey = `health.programNotes.${noteKey}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? note : translated;
}

/** Translate relative day tokens stored in English for logic (`Today`, `Yesterday`, `—`). */
export function tRelativeDay(t: TFunction, value: string): string {
  if (value === 'Today') return t('common.today');
  if (value === 'Yesterday') return t('common.yesterday');
  if (value === 'Tomorrow') return t('common.tomorrow');
  if (value === '—' || value === '-') return value;

  const daysAgo = /^(\d+)\s+days?\s+ago$/i.exec(value);
  if (daysAgo) {
    return t('common.daysAgo', { count: Number(daysAgo[1]) });
  }

  const minutesAgo = /^(\d+)\s+min(?:utes?)?\s+ago$/i.exec(value);
  if (minutesAgo) {
    return t('common.minutesAgo', { count: Number(minutesAgo[1]) });
  }

  const hoursAgo = /^(\d+)\s+hr(?:s?)?\s+ago$/i.exec(value);
  if (hoursAgo) {
    return t('common.hoursAgo', { count: Number(hoursAgo[1]) });
  }

  const inDays = /^In\s+(\d+)\s+days?$/i.exec(value);
  if (inDays) {
    return t('common.inDays', { count: Number(inDays[1]) });
  }

  return value;
}

/** Translate journal category enum stored in English. */
export function tJournalCategory(t: TFunction, category: string): string {
  const i18nKey = `journal.categories.${category}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? category : translated;
}

/** Localized exercise subtitle (cardio zones / intensity / reps). */
export function tExerciseSubtitle(t: TFunction, template: ProgramExerciseTemplate): string {
  if (template.isCardio) {
    const zones = (template.targetHeartRateZones ?? [1, 2]).join('–');
    return t('health.cardioSubtitle', {
      minutes: template.cardioDurationMinutes ?? 0,
      zones,
    });
  }
  if (template.intensityPercentage) {
    return t('health.intensity1rm', { pct: template.intensityPercentage });
  }
  return template.repsTarget;
}

/** Resolve muscle-group chrome key from a program focus name. */
export function muscleGroupKeyFromFocus(focusName: string): string {
  const lower = focusName.toLowerCase();
  if (lower.includes('rest') || lower.includes('recovery')) return 'mobility';
  if (lower.includes('cardio')) return 'cardio';
  if (lower.includes('push') || lower.includes('press')) return 'push';
  if (lower.includes('pull') || lower.includes('back')) return 'pull';
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('lower')) return 'legs';
  if (lower.includes('upper')) return 'upper';
  if (lower.includes('core') || lower.includes('full')) return 'full';
  if (lower.includes('arm')) return 'arms';
  return 'default';
}

/** Translate a program focus label by matching the English focus name on a track. */
export function tWorkoutFocusName(
  t: TFunction,
  focusName: string,
  days: Array<{ weekNumber: number; dayNumber: number; focusName: string }>,
  programId: string,
): string {
  const match = days.find((day) => day.focusName === focusName);
  if (!match) return focusName;
  return tWorkoutProgramDay(t, programId, match.weekNumber, match.dayNumber, focusName);
}

/** Translate muscle-group summary for a program focus name. */
export function tMuscleGroups(t: TFunction, focusName: string, fallback?: string): string {
  const key = muscleGroupKeyFromFocus(focusName);
  if (key === 'default') {
    return fallback ?? focusName;
  }
  const i18nKey = `health.muscleGroupLabels.${key}`;
  const translated = t(i18nKey);
  return translated === i18nKey ? (fallback ?? focusName) : translated;
}
