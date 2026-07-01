export type PlannerWeekDay = {
  key: string;
  date: number;
  label: string;
  isToday: boolean;
};

export type PlannerMonthDay = {
  key: string;
  date: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

export type PlannerSubtask = {
  id: string;
  title: string;
  completed: boolean;
};

export type PlannerPrioritizedTask = {
  id: string;
  title: string;
  time?: string;
  completed: boolean;
  subtasks?: PlannerSubtask[];
};

export type PlannerTimelineDay = {
  key: string;
  weekday: string;
  dayNumber: number;
  isToday: boolean;
};

export type PlannerProjectTimeline = {
  id: string;
  title: string;
  dayIndex: number;
  /** 0–1 completion */
  progress: number;
  isComplete: boolean;
  time?: string;
  subtaskDone: number;
  subtaskTotal: number;
};

export type JournalEntry = {
  timestamp: string;
  body: string;
};

export type PlannerHabitItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type PlannerTaskItem = {
  id: string;
  title: string;
  time: string;
  completed: boolean;
  dayLabel?: string;
  dueDate?: string;
  subtasks?: PlannerSubtask[];
};

export type PlannerEventItem = {
  id: string;
  title: string;
  time: string;
  location?: string;
};

export type DayAgenda = {
  journal: JournalEntry;
  habits: PlannerHabitItem[];
  tasks: PlannerTaskItem[];
  events: PlannerEventItem[];
};

export type NewTaskDraft = {
  title: string;
  dueDate: string;
  subtasks?: string[];
};
