import { buildTasksForDayOrFilter } from '../../lib/planner/taskRollover';
import { toDayKey } from '../../utils/plannerDates';

describe('buildTasksForDayOrFilter', () => {
  const start = '2026-07-13T00:00:00.000Z';
  const end = '2026-07-14T00:00:00.000Z';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-13T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('includes incomplete is_today tasks on today but not bare is_today', () => {
    const filter = buildTasksForDayOrFilter(toDayKey(new Date()), start, end);
    expect(filter).toContain('and(is_today.eq.true,completed.eq.false)');
    expect(filter).not.toContain('is_today.eq.true,and(created_at');
  });

  it('does not carry is_today clause on past days', () => {
    const filter = buildTasksForDayOrFilter('2026-07-12', start, end);
    expect(filter).not.toContain('is_today');
  });
});
