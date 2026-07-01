export type FocusSessionType = 'focus' | 'short_break' | 'long_break';

export type FocusModePreset = {
  id: FocusSessionType;
  label: string;
  durationSeconds: number;
};

export const FOCUS_MODE_PRESETS: FocusModePreset[] = [
  { id: 'focus', label: 'Focus', durationSeconds: 25 * 60 },
  { id: 'short_break', label: 'Short Break', durationSeconds: 5 * 60 },
  { id: 'long_break', label: 'Long Break', durationSeconds: 15 * 60 },
];

export type FocusTimerStatus = 'idle' | 'running' | 'paused' | 'completed';
