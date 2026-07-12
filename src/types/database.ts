/** Supabase `profiles` table row shape. */
export type ProfileRow = {
  id: string;
  username: string;
  level: number;
  xp: number;
  days_active: number;
  focus_hours: number;
  habits_count: number;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  height_cm?: number | null;
  activity_factor?: number | null;
  diet_goal?: 'fat_loss' | 'maintenance' | 'bulk' | null;
  goal_pace_kg?: number | null;
  current_rank?: string;
  is_pro?: boolean;
  pro_expires_at?: string | null;
  tma_trial_started_at?: string | null;
  telegram_user_id?: number | null;
  telegram_reminders_enabled?: boolean;
  timezone?: string;
  last_active_at?: string | null;
  updated_at: string;
};

export type ExercisePrRow = {
  id: string;
  user_id: string;
  exercise_name: string;
  estimated_1rm_kg: number;
  best_weight_kg: number;
  best_reps: number;
  achieved_at: string;
  updated_at: string;
};

/** Public leaderboard entry (view or ranked query result). */
export type LeaderboardEntry = {
  id: string;
  username: string;
  level: number;
  xp: number;
  days_active: number;
  focus_hours: number;
  habits_count: number;
  rank_position: number;
  performance_tier?: string;
  performance_tier_label?: string;
};

/** Current user's leaderboard context. */
export type CurrentUserLeaderboard = {
  profile: ProfileRow;
  rank_position: number;
  percentile: number;
  total_users: number;
};

export type LeaderboardState = {
  topUsers: LeaderboardEntry[];
  currentUser: CurrentUserLeaderboard | null;
  isLoading: boolean;
  error: string | null;
};

/** Fields clients may update after in-app actions. */
export type ProfileStatsUpdate = Partial<
  Pick<ProfileRow, 'level' | 'xp' | 'days_active' | 'focus_hours' | 'habits_count'>
>;

export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  is_today: boolean;
  due_date: string | null;
  scheduled_time: string | null;
  completed: boolean;
  is_monetized?: boolean;
  payout_amount?: number | null;
  finance_category?: string | null;
  created_at: string;
};

export type HabitRow = {
  id: string;
  user_id: string;
  title: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
};

export type HabitLogRow = {
  id: string;
  habit_id: string;
  user_id: string;
  logged_on: string;
  completed: boolean;
  created_at: string;
};

export type WorkoutSessionRow = {
  id: string;
  user_id: string;
  session_date: string;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
  track_slug?: string | null;
  day_focus?: string | null;
  duration_minutes?: number | null;
  calories_burned?: number | null;
  xp_earned?: number | null;
  tonnage_kg?: number | null;
};

export type DailyNutritionLogRow = {
  id: string;
  user_id: string;
  log_date: string;
  calories_consumed: number;
  calorie_target: number;
  meal_slots?: Record<string, string | null> | null;
  quick_meals?: Record<string, { name: string; calories: number } | null> | null;
  updated_at: string;
};

export type TransactionRow = {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  label: string | null;
  account_id?: string | null;
  note?: string | null;
  occurred_at?: string | null;
  source_type?: string | null;
  source_ref?: string | null;
  created_at: string;
};

export type BudgetRow = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
};

export type FinanceAccountRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
  is_default: boolean;
  balance?: number;
  account_type?: string;
  created_at: string;
};

export type FinanceGoalRow = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type FinanceSubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_billing_date: string | null;
  account_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type WaterLogRow = {
  id: string;
  user_id: string;
  amount_ml: number;
  logged_at: string;
};

export type WeightLogRow = {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_on: string;
  logged_at: string;
};

export type JournalEntryRow = {
  id: string;
  user_id: string;
  day_key: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type IngredientRow = {
  id: string;
  name: string;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  calories_per_100g: number;
  unit: string;
};

export type MealRow = {
  meal_id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cuisine: string;
  tier: 'cheap' | 'mid' | 'premium';
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  goal_tags: string[];
  prep_time: number;
  swap_ids: string[];
};

export type MealIngredientRow = {
  meal_id: string;
  ingredient_id: string;
  grams: number;
};

export type WorkoutTrackRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_weeks: number;
  created_at: string;
};

export type WorkoutDayRow = {
  id: string;
  track_id: string;
  week_number: number;
  day_number: number;
  focus_name: string;
  notes: string | null;
};

export type WorkoutExerciseRow = {
  id: string;
  day_id: string;
  exercise_name: string;
  sets_count: number;
  reps_target: string;
  intensity_percentage: number | null;
  rest_seconds: number | null;
  is_cardio: boolean | null;
  cardio_duration_minutes: number | null;
  primary_muscles: string[];
  secondary_muscles: string[] | null;
  sort_order: number;
};

export type TaskSubtaskRow = {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
};

export type MoodLogRow = {
  id: string;
  user_id: string;
  mood_score: number;
  note: string | null;
  logged_on: string;
  logged_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'updated_at'> & {
          updated_at?: string;
        };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      tasks: {
        Row: TaskRow;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          is_today?: boolean;
          due_date?: string | null;
          scheduled_time?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: Partial<TaskRow>;
        Relationships: [];
      };
      habits: {
        Row: HabitRow;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          days_of_week?: number[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<HabitRow>;
        Relationships: [];
      };
      habit_logs: {
        Row: HabitLogRow;
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          logged_on?: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: Partial<HabitLogRow>;
        Relationships: [];
      };
      workout_sessions: {
        Row: WorkoutSessionRow;
        Insert: {
          id?: string;
          user_id: string;
          session_date?: string;
          completed?: boolean;
          completed_at?: string | null;
          updated_at?: string;
          track_slug?: string | null;
          day_focus?: string | null;
          duration_minutes?: number | null;
          calories_burned?: number | null;
          xp_earned?: number | null;
          tonnage_kg?: number | null;
        };
        Update: Partial<WorkoutSessionRow>;
        Relationships: [];
      };
      daily_nutrition_logs: {
        Row: DailyNutritionLogRow;
        Insert: {
          id?: string;
          user_id: string;
          log_date?: string;
          calories_consumed?: number;
          calorie_target?: number;
          meal_slots?: Record<string, string | null> | null;
          quick_meals?: Record<string, { name: string; calories: number } | null> | null;
          updated_at?: string;
        };
        Update: Partial<DailyNutritionLogRow>;
        Relationships: [];
      };
      transactions: {
        Row: TransactionRow;
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          label?: string | null;
          account_id?: string | null;
          note?: string | null;
          occurred_at?: string | null;
          source_type?: string | null;
          source_ref?: string | null;
          created_at?: string;
        };
        Update: Partial<TransactionRow>;
        Relationships: [];
      };
      finance_accounts: {
        Row: FinanceAccountRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color?: string;
          currency?: string;
          is_default?: boolean;
          balance?: number;
          account_type?: string;
          created_at?: string;
        };
        Update: Partial<FinanceAccountRow>;
        Relationships: [];
      };
      budgets: {
        Row: BudgetRow;
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          monthly_limit: number;
          created_at?: string;
        };
        Update: Partial<BudgetRow>;
        Relationships: [];
      };
      finance_goals: {
        Row: FinanceGoalRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          saved_amount?: number;
          target_date?: string | null;
          icon?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<FinanceGoalRow>;
        Relationships: [];
      };
      finance_subscriptions: {
        Row: FinanceSubscriptionRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          currency?: string;
          billing_cycle?: string;
          next_billing_date?: string | null;
          account_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<FinanceSubscriptionRow>;
        Relationships: [];
      };
      water_logs: {
        Row: WaterLogRow;
        Insert: {
          id?: string;
          user_id: string;
          amount_ml: number;
          logged_at?: string;
        };
        Update: Partial<WaterLogRow>;
        Relationships: [];
      };
      weight_logs: {
        Row: WeightLogRow;
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          logged_on?: string;
          logged_at?: string;
        };
        Update: Partial<WeightLogRow>;
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: {
          id?: string;
          user_id: string;
          day_key: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<JournalEntryRow>;
        Relationships: [];
      };
      task_subtasks: {
        Row: TaskSubtaskRow;
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          title: string;
          completed?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<TaskSubtaskRow>;
        Relationships: [];
      };
      mood_logs: {
        Row: MoodLogRow;
        Insert: {
          id?: string;
          user_id: string;
          mood_score: number;
          note?: string | null;
          logged_on?: string;
          logged_at?: string;
        };
        Update: Partial<MoodLogRow>;
        Relationships: [];
      };
      ingredients: {
        Row: IngredientRow;
        Insert: IngredientRow;
        Update: Partial<IngredientRow>;
        Relationships: [];
      };
      meals: {
        Row: MealRow;
        Insert: MealRow;
        Update: Partial<MealRow>;
        Relationships: [];
      };
      meal_ingredients: {
        Row: MealIngredientRow;
        Insert: MealIngredientRow;
        Update: Partial<MealIngredientRow>;
        Relationships: [];
      };
      workout_tracks: {
        Row: WorkoutTrackRow;
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          duration_weeks?: number;
          created_at?: string;
        };
        Update: Partial<WorkoutTrackRow>;
        Relationships: [];
      };
      workout_days: {
        Row: WorkoutDayRow;
        Insert: {
          id?: string;
          track_id: string;
          week_number: number;
          day_number: number;
          focus_name: string;
          notes?: string | null;
        };
        Update: Partial<WorkoutDayRow>;
        Relationships: [];
      };
      workout_exercises: {
        Row: WorkoutExerciseRow;
        Insert: {
          id?: string;
          day_id: string;
          exercise_name: string;
          sets_count: number;
          reps_target: string;
          intensity_percentage?: number | null;
          rest_seconds?: number | null;
          is_cardio?: boolean | null;
          cardio_duration_minutes?: number | null;
          primary_muscles?: string[];
          secondary_muscles?: string[] | null;
          sort_order?: number;
        };
        Update: Partial<WorkoutExerciseRow>;
        Relationships: [];
      };
      focus_sessions: {
        Row: import('./achievements').FocusSessionRow;
        Insert: {
          id?: string;
          user_id: string;
          session_type: 'focus' | 'short_break' | 'long_break';
          duration_seconds: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: Partial<import('./achievements').FocusSessionRow>;
        Relationships: [];
      };
      user_achievements: {
        Row: import('./achievements').UserAchievementRow;
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          progress?: number;
          unlocked_at?: string | null;
          xp_collected?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<import('./achievements').UserAchievementRow>;
        Relationships: [];
      };
      xp_ledger: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          source_type?: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          amount: number;
          source_type: string;
          created_at: string;
        }>;
        Relationships: [];
      };
      exercise_prs: {
        Row: ExercisePrRow;
        Insert: {
          id?: string;
          user_id: string;
          exercise_name: string;
          estimated_1rm_kg: number;
          best_weight_kg: number;
          best_reps: number;
          achieved_at?: string;
          updated_at?: string;
        };
        Update: Partial<ExercisePrRow>;
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: LeaderboardEntry;
        Relationships: [];
      };
    };
    Functions: {
      award_xp_and_check_level: {
        Args: { user_id: string; xp_amount: number; source_type?: string };
        Returns: {
          leveled_up: boolean;
          new_level: number;
          new_xp: number;
        }[];
      };
      sync_user_achievements: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['user_achievements']['Row'][];
      };
      collect_achievement_reward: {
        Args: { p_achievement_id: string };
        Returns: {
          leveled_up: boolean;
          new_level: number;
          new_xp: number;
          xp_awarded: number;
        }[];
      };
      user_has_pro_access: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      xp_required_for_level: {
        Args: { p_level: number };
        Returns: number;
      };
      get_user_tier: {
        Args: { user_level: number };
        Returns: string;
      };
      get_user_tier_label: {
        Args: { user_level: number };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
