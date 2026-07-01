import type { MuscleHighlight, MuscleId } from '../../types/workout';

/** Keyword → muscle mapping for English exercise names. */
const EXERCISE_MUSCLE_RULES: Array<{ pattern: RegExp; primary: MuscleId[]; secondary?: MuscleId[] }> = [
  { pattern: /warm.?up|warm/i, primary: ['core'], secondary: ['quadriceps'] },
  {
    pattern: /cardio|treadmill|elliptical|stationary bike|rowing/i,
    primary: ['core'],
    secondary: ['quadriceps', 'calves'],
  },
  {
    pattern: /bench|pec deck|fly|push.?up|crossover|dip/i,
    primary: ['chest'],
    secondary: ['triceps', 'abs_anterior'],
  },
  {
    pattern: /row|pullover|pull.?up|lat|hammer strength/i,
    primary: ['lats'],
    secondary: ['biceps', 'trapezius'],
  },
  { pattern: /deadlift|hyperextension|romanian|stiff.?leg/i, primary: ['lower_back'], secondary: ['hamstrings', 'glutes'] },
  {
    pattern: /squat|goblet|lunge|bulgarian|leg press|leg ext|leg curl|glute|hack squat/i,
    primary: ['quadriceps', 'glutes'],
    secondary: ['hamstrings', 'calves'],
  },
  {
    pattern: /shoulder|press|delt|lateral|upright|face pull|thruster/i,
    primary: ['deltoids'],
    secondary: ['trapezius', 'triceps'],
  },
  { pattern: /curl|bicep|hammer|ez.?bar/i, primary: ['biceps'], secondary: ['forearms'] },
  {
    pattern: /tricep|rope push|overhead ext|french|pushdown/i,
    primary: ['triceps'],
    secondary: ['deltoids'],
  },
  { pattern: /core|abs|crunch|plank|mountain climber/i, primary: ['abs'], secondary: ['obliques', 'core'] },
  { pattern: /calves|calf raise/i, primary: ['calves'], secondary: [] },
  { pattern: /pulldown/i, primary: ['lats'], secondary: ['biceps'] },
];

export function resolveMusclesForExercise(name: string): MuscleHighlight {
  const normalized = name.toLowerCase();

  for (const rule of EXERCISE_MUSCLE_RULES) {
    if (rule.pattern.test(normalized)) {
      return {
        primary: rule.primary,
        secondary: rule.secondary ?? [],
      };
    }
  }

  return { primary: ['core'], secondary: [] };
}

export function mergeMuscleHighlights(items: MuscleHighlight[]): MuscleId[] {
  const set = new Set<MuscleId>();
  for (const item of items) {
    item.primary.forEach((m) => set.add(m));
    item.secondary.forEach((m) => set.add(m));
  }
  return Array.from(set);
}
