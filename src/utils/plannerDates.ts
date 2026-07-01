import type { PlannerTimelineDay } from '../types/planner';

export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

export function getWeekStart(reference = new Date()): Date {
  const dayOfWeek = reference.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(reference);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(reference.getDate() + mondayOffset);
  return monday;
}

export function buildWeekForDate(reference: Date) {
  const todayKey = toDayKey(new Date());
  const monday = getWeekStart(reference);
  const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return labels.map((label, index) => {
    const date = addDays(monday, index);

    return {
      key: toDayKey(date),
      date: date.getDate(),
      label,
      isToday: toDayKey(date) === todayKey,
    };
  });
}

/** @deprecated Use buildWeekForDate — kept for welcome progress helpers. */
export function buildCurrentWeek(reference = new Date()) {
  return buildWeekForDate(reference);
}

export function formatMonthYear(date: Date): string {
  return date
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    .toUpperCase();
}

export function formatPlannerHeaderDate(dayKey: string): string {
  const date = parseDayKey(dayKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSelectedHeading(dayKey: string) {
  const date = parseDayKey(dayKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const WEEKDAY_LABELS_SUN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export function buildMonthGrid(viewMonth: Date, selectedDayKey: string) {
  const todayKey = toDayKey(new Date());
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1, 12, 0, 0, 0);
  const leading = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: Array<{
    key: string;
    date: number;
    inCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  for (let index = leading - 1; index >= 0; index -= 1) {
    const dayNumber = daysInPrevMonth - index;
    const date = new Date(year, month - 1, dayNumber, 12, 0, 0, 0);
    const key = toDayKey(date);
    cells.push({
      key,
      date: dayNumber,
      inCurrentMonth: false,
      isToday: key === todayKey,
      isSelected: key === selectedDayKey,
    });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const date = new Date(year, month, dayNumber, 12, 0, 0, 0);
    const key = toDayKey(date);
    cells.push({
      key,
      date: dayNumber,
      inCurrentMonth: true,
      isToday: key === todayKey,
      isSelected: key === selectedDayKey,
    });
  }

  while (cells.length % 7 !== 0) {
    const dayNumber = cells.length - leading - daysInMonth + 1;
    const date = new Date(year, month + 1, dayNumber, 12, 0, 0, 0);
    const key = toDayKey(date);
    cells.push({
      key,
      date: dayNumber,
      inCurrentMonth: false,
      isToday: key === todayKey,
      isSelected: key === selectedDayKey,
    });
  }

  return {
    weekdayLabels: WEEKDAY_LABELS_SUN,
    days: cells,
  };
}

export function buildTimelineDayLabels(anchorDayKey: string): string[] {
  return buildTimelineWindowDays(anchorDayKey).map((day) => day.weekday);
}

export function buildTimelineWindowDays(anchorDayKey: string): PlannerTimelineDay[] {
  const todayKey = toDayKey(new Date());
  const windowStart = addDays(parseDayKey(anchorDayKey), -2);

  return Array.from({ length: 4 }, (_, index) => {
    const date = addDays(windowStart, index);
    const key = toDayKey(date);

    return {
      key,
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: key === todayKey,
    };
  });
}

/** 0–1 position of current time within the 4-day window, or null if outside. */
export function timelineNowPosition(anchorDayKey: string, now = new Date()): number | null {
  const windowStart = addDays(parseDayKey(anchorDayKey), -2);
  windowStart.setHours(0, 0, 0, 0);
  const windowEnd = addDays(windowStart, 4);
  const nowMs = now.getTime();

  if (nowMs < windowStart.getTime() || nowMs >= windowEnd.getTime()) {
    return null;
  }

  const span = windowEnd.getTime() - windowStart.getTime();
  if (span <= 0) {
    return null;
  }

  return Math.min(1, Math.max(0, (nowMs - windowStart.getTime()) / span));
}
