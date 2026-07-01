/**
 * Smoke coverage for core live modules used in the auth → task → XP → leaderboard flow.
 */

import * as catalog from '../lib/catalog';
import * as gamificationService from '../lib/gamification/service';
import { XP_REWARDS } from '../lib/gamification/xpActions';
import * as plannerService from '../lib/planner/service';
import * as subtaskService from '../lib/planner/subtaskService';

describe('module smoke', () => {
  it('loads gamification and planner services', () => {
    expect(XP_REWARDS.TASK_COMPLETE).toBeGreaterThan(0);
    expect(typeof plannerService.fetchTasksForDay).toBe('function');
    expect(typeof plannerService.fetchAllTasks).toBe('function');
    expect(typeof gamificationService.fetchGlobalLeaderboard).toBe('function');
    expect(typeof subtaskService.insertSubtask).toBe('function');
    expect(typeof subtaskService.toggleSubtaskCompletion).toBe('function');
  });

  it('loads catalog hydration entrypoints', () => {
    expect(typeof catalog.hydrateCatalog).toBe('function');
    expect(typeof catalog.getWorkoutTrack).toBe('function');
    expect(typeof catalog.getMealLibrary).toBe('function');
  });
});
