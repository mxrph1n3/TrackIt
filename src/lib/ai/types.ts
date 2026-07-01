export type TrackItCoachPayload = {
  user_profile: {
    level: number;
    xp: number;
    rank: string;
    username?: string;
  };
  stats: {
    discipline: number;
    habits: number;
    mindset: number;
    health: number;
  };
  tasks_today: Array<{ title: string; completed: boolean; time?: string }>;
  habits_streaks: Record<string, number>;
  workout_logs: {
    last_session: string | null;
    volume_load_kg: number;
    streak_days: number;
    total_workouts: number;
  };
  nutrition_logs: {
    calories_consumed: number;
    target: number;
    macros: { P: number; F: number; C: number };
  };
  finance_logs: {
    monthly_budget: number;
    expenses_current: number;
    income_current: number;
    balance: number;
    display_currency: string;
    savings_goal: {
      name: string;
      target: number;
      saved: number;
    } | null;
  };
};

export type AiCoachAnalyzeRequest = {
  payload: TrackItCoachPayload;
  prompt?: string;
};

export type AiCoachAnalyzeResponse = {
  advice: string;
  model?: string;
};
