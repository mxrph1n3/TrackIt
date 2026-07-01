import {
  allSubtasksComplete,
  buildPrioritizedTasks,
  buildProjectTimelines,
  hasPartialSubtaskProgress,
  taskCompletionProgress,
} from '../lib/planner/presentation';
import type { PlannerTaskItem } from '../types/planner';

const baseTask = (overrides: Partial<PlannerTaskItem> = {}): PlannerTaskItem => ({
  id: 'task-1',
  title: 'Ship release',
  time: '10:00',
  completed: false,
  ...overrides,
});

describe('planner presentation', () => {
  it('calculates task progress from subtasks', () => {
    const task = baseTask({
      subtasks: [
        { id: 's1', title: 'A', completed: true },
        { id: 's2', title: 'B', completed: false },
      ],
    });

    expect(taskCompletionProgress(task)).toBe(0.5);
  });

  it('marks parent complete progress as 1 when no subtasks', () => {
    expect(taskCompletionProgress(baseTask({ completed: true }))).toBe(1);
    expect(taskCompletionProgress(baseTask({ completed: false }))).toBe(0);
  });

  it('detects all subtasks complete', () => {
    expect(
      allSubtasksComplete([
        { id: 's1', title: 'A', completed: true },
        { id: 's2', title: 'B', completed: true },
      ]),
    ).toBe(true);

    expect(
      allSubtasksComplete([
        { id: 's1', title: 'A', completed: true },
        { id: 's2', title: 'B', completed: false },
      ]),
    ).toBe(false);
  });

  it('detects partial subtask progress', () => {
    expect(
      hasPartialSubtaskProgress([
        { id: 's1', title: 'A', completed: true },
        { id: 's2', title: 'B', completed: false },
      ]),
    ).toBe(true);

    expect(hasPartialSubtaskProgress([])).toBe(false);
    expect(
      hasPartialSubtaskProgress([
        { id: 's1', title: 'A', completed: false },
        { id: 's2', title: 'B', completed: false },
      ]),
    ).toBe(false);
  });

  it('builds prioritized tasks with subtasks preserved', () => {
    const tasks = [
      baseTask({
        subtasks: [{ id: 's1', title: 'Write tests', completed: false }],
      }),
    ];

    expect(buildPrioritizedTasks(tasks)).toEqual([
      {
        id: 'task-1',
        title: 'Ship release',
        time: '10:00',
        completed: false,
        subtasks: [{ id: 's1', title: 'Write tests', completed: false }],
      },
    ]);
  });

  it('builds project timelines from tasks aligned to the anchor day window', () => {
    const timelines = buildProjectTimelines(
      [
        baseTask({
          dueDate: '2026-06-26',
          subtasks: [
            { id: 's1', title: 'A', completed: true },
            { id: 's2', title: 'B', completed: true },
          ],
        }),
        baseTask({ id: 'task-2', title: 'Second', completed: false, dueDate: '2026-06-26' }),
      ],
      '2026-06-26',
    );

    expect(timelines).toHaveLength(2);
    expect(timelines[0]?.progress).toBe(1);
    expect(timelines[0]?.id).toBe('project-task-1');
    expect(timelines[0]?.dayIndex).toBeGreaterThanOrEqual(0);
    expect(timelines[0]?.isComplete).toBe(true);
    expect(timelines[0]?.subtaskTotal).toBe(2);
  });
});
