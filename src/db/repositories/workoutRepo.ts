import { getDB } from '../database';
import type { Workout, WorkoutExercise, WorkoutSet } from '../../types';
import { todayISO } from '../../utils/formatters';

export async function getWorkouts(limitDays?: number): Promise<Workout[]> {
  if (limitDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - limitDays);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return getDB().getAllAsync<Workout>(
      'SELECT * FROM workouts WHERE date >= ? ORDER BY date DESC',
      [cutoffStr]
    );
  }
  return getDB().getAllAsync<Workout>(
    'SELECT * FROM workouts ORDER BY date DESC'
  );
}

export async function getWorkoutById(id: number): Promise<Workout | null> {
  return getDB().getFirstAsync<Workout>(
    'SELECT * FROM workouts WHERE id = ?', [id]
  );
}

export async function createWorkout(date: string = todayISO(), notes: string = ''): Promise<number> {
  const result = await getDB().runAsync(
    'INSERT INTO workouts (date, body_parts, notes) VALUES (?, ?, ?)',
    [date, '[]', notes]
  );
  return result.lastInsertRowId;
}

export async function updateWorkoutBodyParts(workoutId: number, bodyParts: string[]): Promise<void> {
  await getDB().runAsync(
    'UPDATE workouts SET body_parts = ? WHERE id = ?',
    [JSON.stringify(bodyParts), workoutId]
  );
}

export async function updateWorkoutNotes(workoutId: number, notes: string): Promise<void> {
  await getDB().runAsync(
    'UPDATE workouts SET notes = ? WHERE id = ?',
    [notes, workoutId]
  );
}

export async function deleteWorkout(id: number): Promise<void> {
  await getDB().runAsync('DELETE FROM workouts WHERE id = ?', [id]);
}

// Workout Exercises
export async function getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
  return getDB().getAllAsync<WorkoutExercise>(`
    SELECT we.*, e.name AS exercise_name, e.body_part
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    WHERE we.workout_id = ?
    ORDER BY we.order_index
  `, [workoutId]);
}

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  orderIndex: number
): Promise<number> {
  const result = await getDB().runAsync(
    'INSERT INTO workout_exercises (workout_id, exercise_id, order_index) VALUES (?, ?, ?)',
    [workoutId, exerciseId, orderIndex]
  );
  return result.lastInsertRowId;
}

export async function removeExerciseFromWorkout(workoutExerciseId: number): Promise<void> {
  await getDB().runAsync(
    'DELETE FROM workout_exercises WHERE id = ?', [workoutExerciseId]
  );
}

// Sets
export async function getSetsForWorkoutExercise(workoutExerciseId: number): Promise<WorkoutSet[]> {
  return getDB().getAllAsync<WorkoutSet>(
    'SELECT * FROM sets WHERE workout_exercise_id = ? ORDER BY set_number',
    [workoutExerciseId]
  );
}

export async function addSet(
  workoutExerciseId: number,
  setNumber: number,
  weight: number,
  reps: number
): Promise<number> {
  const result = await getDB().runAsync(
    'INSERT INTO sets (workout_exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?)',
    [workoutExerciseId, setNumber, weight, reps]
  );
  return result.lastInsertRowId;
}

export async function updateSet(id: number, weight: number, reps: number): Promise<void> {
  await getDB().runAsync(
    'UPDATE sets SET weight = ?, reps = ? WHERE id = ?',
    [weight, reps, id]
  );
}

export async function deleteSet(id: number): Promise<void> {
  await getDB().runAsync('DELETE FROM sets WHERE id = ?', [id]);
}

export async function getAllSetsForWorkout(workoutId: number): Promise<(WorkoutSet & { exercise_id: number })[]> {
  return getDB().getAllAsync<WorkoutSet & { exercise_id: number }>(`
    SELECT s.*, we.exercise_id
    FROM sets s
    JOIN workout_exercises we ON we.id = s.workout_exercise_id
    WHERE we.workout_id = ?
  `, [workoutId]);
}

export async function getWorkoutCount(): Promise<number> {
  const row = await getDB().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM workouts'
  );
  return row?.count ?? 0;
}
