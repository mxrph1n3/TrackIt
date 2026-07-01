import { selectNotificationForSlot } from '../lib/notifications/selector';
import type { NotificationContext } from '../lib/notifications/types';

function baseContext(overrides: Partial<NotificationContext> = {}): NotificationContext {
  return {
    incompleteTaskCount: 0,
    totalTaskCount: 0,
    completedTaskCount: 0,
    streakDays: 0,
    daysInactive: 0,
    hasActivityToday: false,
    allTasksComplete: false,
    hardcoreMode: false,
    enabled: true,
    ...overrides,
  };
}

describe('selectNotificationForSlot', () => {
  it('returns comeback message after absence', () => {
    const message = selectNotificationForSlot('morning', baseContext({ daysInactive: 3 }));
    expect(message?.category).toBe('comeback');
    expect(message?.body).toContain('month');
  });

  it('returns celebration when all tasks are complete at night', () => {
    const message = selectNotificationForSlot(
      'night',
      baseContext({
        totalTaskCount: 4,
        completedTaskCount: 4,
        allTasksComplete: true,
      }),
    );
    expect(message?.category).toBe('celebration');
  });

  it('skips late slot when user already had activity', () => {
    const message = selectNotificationForSlot(
      'late',
      baseContext({ hasActivityToday: true }),
    );
    expect(message).toBeNull();
  });

  it('includes task count in afternoon reminders', () => {
    const message = selectNotificationForSlot(
      'afternoon',
      baseContext({ incompleteTaskCount: 5, totalTaskCount: 5 }),
    );
    expect(message?.body).toMatch(/5/);
  });

  it('returns null when notifications disabled', () => {
    const message = selectNotificationForSlot('morning', baseContext({ enabled: false }));
    expect(message).toBeNull();
  });
});
