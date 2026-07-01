export type QuoteCategory = 'all' | 'discipline' | 'success' | 'mindset' | 'life';

export type QuoteItem = {
  id: string;
  text: string;
  author: string;
  category: Exclude<QuoteCategory, 'all'>;
  accent: string;
};

export const QUOTE_FILTERS: Array<{ id: QuoteCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'success', label: 'Success' },
  { id: 'mindset', label: 'Mindset' },
  { id: 'life', label: 'Life' },
];

export const QUOTES: QuoteItem[] = [
  {
    id: 'q1',
    text: 'The pain you feel today will be the strength you feel tomorrow.',
    author: 'Unknown',
    category: 'discipline',
    accent: '#775DD8',
  },
  {
    id: 'q2',
    text: 'Discipline is the bridge between goals and accomplishment.',
    author: 'Jim Rohn',
    category: 'discipline',
    accent: '#6366F1',
  },
  {
    id: 'q3',
    text: 'Focus on being productive instead of being busy.',
    author: 'Tim Ferriss',
    category: 'mindset',
    accent: '#7C3AED',
  },
  {
    id: 'q4',
    text: 'Your future is created by what you do today, not tomorrow.',
    author: 'Robert Kiyosaki',
    category: 'success',
    accent: '#5B21B6',
  },
  {
    id: 'q5',
    text: 'Small consistent actions create enormous results over time.',
    author: 'TrackIt',
    category: 'life',
    accent: '#9333EA',
  },
  {
    id: 'q6',
    text: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
    category: 'success',
    accent: '#4F46E5',
  },
  {
    id: 'q7',
    text: 'The mind is everything. What you think you become.',
    author: 'Buddha',
    category: 'mindset',
    accent: '#6D28D9',
  },
  {
    id: 'q8',
    text: 'Life is 10% what happens to you and 90% how you react to it.',
    author: 'Charles R. Swindoll',
    category: 'life',
    accent: '#7E22CE',
  },
];
