import { inferJournalCategory } from '../lib/journal/journalService';
import { MISSION_MILESTONES } from '../constants/missionRoadmap';

describe('journal categories', () => {
  it('infers health and mindset categories from keywords', () => {
    expect(inferJournalCategory('Great workout today, hit a new PR.')).toBe('Health');
    expect(inferJournalCategory('Deep focus session and calm mindset.')).toBe('Mindset');
    expect(inferJournalCategory('Grateful for small wins.')).toBe('Motivation');
    expect(inferJournalCategory('Quiet day.')).toBe('Reflection');
  });
});

describe('mission roadmap constants', () => {
  it('defines four ordered milestones', () => {
    expect(MISSION_MILESTONES).toHaveLength(4);
    expect(MISSION_MILESTONES.map((item) => item.id)).toEqual([
      'discipline_foundation',
      'consistency_builder',
      'mindset_upgrade',
      'legacy_creator',
    ]);
  });
});
