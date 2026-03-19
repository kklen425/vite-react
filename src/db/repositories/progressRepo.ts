import { getDB } from '../database';
import type { ProgressPoint } from '../../types';
import type { UserProfile } from '../../types';

export async function getProgressForExercise(exerciseId: number): Promise<ProgressPoint[]> {
  return getDB().getAllAsync<ProgressPoint>(`
    SELECT
      w.date,
      MAX(s.weight)                   AS weight,
      SUM(s.weight * s.reps)          AS volume,
      MAX(s.reps)                     AS reps
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id = ?
    GROUP BY w.date
    ORDER BY w.date ASC
  `, [exerciseId]);
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return getDB().getFirstAsync<UserProfile>(
    'SELECT * FROM user_profile WHERE id = 1'
  );
}

export async function updateUserProfile(fields: Partial<Omit<UserProfile, 'id'>>): Promise<void> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => fields[k]);
  await getDB().runAsync(
    `UPDATE user_profile SET ${setClauses} WHERE id = 1`,
    values as (string | number)[]
  );
}

export async function markOnboardingComplete(): Promise<void> {
  await getDB().runAsync(
    'UPDATE user_profile SET onboarding_completed = 1 WHERE id = 1'
  );
}
