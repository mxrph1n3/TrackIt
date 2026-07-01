import type { QuickInputResult } from '../types/quickActions';

const EXPENSE_RE = /^expense\s+(\d+(?:[.,]\d+)?)\s*(?:₽|rub|rur|\$|usd|€|eur)?\s*(.*)$/i;
const INCOME_RE = /^income\s+(\d+(?:[.,]\d+)?)\s*(?:₽|rub|rur|\$|usd|€|eur)?\s*(.*)$/i;
const MEAL_RE = /^(?:breakfast|lunch|dinner|snack)\s+(.+)$/i;
const WORKOUT_RE = /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+)\s*$/iu;

function parseTimeToken(text: string): { time?: string; rest: string } {
  const match = text.match(/\bat\s+(\d{1,2}[:.]\d{2}|\d{1,2}\s*(?:am|pm))\b/i);
  if (!match || match.index == null) {
    return { rest: text };
  }

  const raw = match[1].replace('.', ':');
  const rest = `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}`.trim();
  return { time: raw, rest };
}

function hasTomorrow(text: string): boolean {
  return /\btomorrow\b/i.test(text);
}

export function parseQuickInput(raw: string): QuickInputResult {
  const text = raw.trim();
  if (!text) {
    return { kind: 'unknown' };
  }

  const expenseMatch = text.match(EXPENSE_RE);
  if (expenseMatch) {
    return {
      kind: 'finance',
      type: 'expense',
      amount: Number.parseFloat(expenseMatch[1].replace(',', '.')),
      label: expenseMatch[2]?.trim() || 'Expense',
    };
  }

  const incomeMatch = text.match(INCOME_RE);
  if (incomeMatch) {
    return {
      kind: 'finance',
      type: 'income',
      amount: Number.parseFloat(incomeMatch[1].replace(',', '.')),
      label: incomeMatch[2]?.trim() || 'Income',
    };
  }

  const mealMatch = text.match(MEAL_RE);
  if (mealMatch) {
    return {
      kind: 'meal',
      mealName: mealMatch[1].trim(),
    };
  }

  const workoutMatch = text.match(WORKOUT_RE);
  if (workoutMatch) {
    return {
      kind: 'workout',
      exercise: workoutMatch[1].trim(),
      weight: Number.parseFloat(workoutMatch[2].replace(',', '.')),
      reps: Number.parseInt(workoutMatch[3], 10),
    };
  }

  const { time, rest } = parseTimeToken(text);
  const tomorrow = hasTomorrow(rest);
  const title = rest.replace(/\btomorrow\b/gi, '').replace(/\s+/g, ' ').trim();

  if (title) {
    return {
      kind: 'task',
      title,
      scheduledTime: time,
      isToday: !tomorrow,
    };
  }

  return { kind: 'unknown' };
}
