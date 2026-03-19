export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  bodyPart: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  volume: number;
  date: string;
  workoutId: string;
}

export interface BodyMetricEntry {
  id: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  waist?: number;
}

export interface CustomExercise {
  id: string;
  name: string;
  bodyPart: string;
}

export interface UserPrefs {
  onboardingComplete: boolean;
  goal: 'muscle' | 'fat' | 'fitness' | null;
  frequency: number | null;
  experience: 'beginner' | 'intermediate' | 'advanced' | null;
  isPro: boolean;
  restTimerSeconds: number;
}

// Legacy format (for migration)
export interface LegacyWorkoutRecord {
  id: number;
  date: string;
  bodyPart: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
}
