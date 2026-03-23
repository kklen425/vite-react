export type BodyPart = '胸' | '背' | '腿' | '膊頭' | '手臂' | '核心';

export type Goal = '增肌' | '減脂' | '健體';
export type Experience = '新手' | '中級' | '高級';

export interface Exercise {
  id: number;
  name: string;
  body_part: BodyPart;
  is_custom: 0 | 1;
}

export interface Workout {
  id: number;
  date: string; // YYYY-MM-DD
  body_parts: string; // JSON array
  notes: string;
  created_at: string;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  order_index: number;
  // joined fields
  exercise_name?: string;
  body_part?: BodyPart;
}

export interface WorkoutSet {
  id: number;
  workout_exercise_id: number;
  set_number: number;
  weight: number;
  reps: number;
}

export interface PersonalRecord {
  id: number;
  exercise_id: number;
  max_weight: number;
  max_reps: number;
  max_volume: number; // weight * reps * sets
  achieved_date: string;
  workout_id: number;
  exercise_name?: string;
}

export interface BodyMetrics {
  id: number;
  date: string;
  weight: number;
  body_fat_pct: number | null;
  waist_cm: number | null;
}

export interface UserProfile {
  id: number;
  goal: Goal;
  training_days_per_week: number;
  experience: Experience;
  rest_timer_default: number; // seconds
  notification_enabled: 0 | 1;
  notification_time: string; // HH:MM
  onboarding_completed: 0 | 1;
}

// UI-only types for workout logging
export interface DraftSet {
  key: string; // temp uuid
  weight: string;
  reps: string;
  saved: boolean;
}

export interface DraftExercise {
  key: string;
  exercise: Exercise;
  sets: DraftSet[];
}

export interface PRAlert {
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume';
  value: number;
}

export interface ProgressPoint {
  date: string;
  weight: number;
  volume: number;
  reps: number;
}

export type OverloadSuggestion = {
  suggestion: 'increase' | 'maintain' | 'decrease';
  message: string;
};
