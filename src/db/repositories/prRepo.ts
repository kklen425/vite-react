import { getDB } from '../database';
import type { PersonalRecord } from '../../types';

export async function getPRForExercise(exerciseId: number): Promise<PersonalRecord | null> {
  return getDB().getFirstAsync<PersonalRecord>(
    'SELECT * FROM personal_records WHERE exercise_id = ?', [exerciseId]
  );
}

export async function getAllPRs(): Promise<PersonalRecord[]> {
  return getDB().getAllAsync<PersonalRecord>(`
    SELECT pr.*, e.name AS exercise_name
    FROM personal_records pr
    JOIN exercises e ON e.id = pr.exercise_id
    ORDER BY pr.achieved_date DESC
  `);
}

export async function getRecentPRs(limit = 5): Promise<PersonalRecord[]> {
  return getDB().getAllAsync<PersonalRecord>(`
    SELECT pr.*, e.name AS exercise_name
    FROM personal_records pr
    JOIN exercises e ON e.id = pr.exercise_id
    ORDER BY pr.achieved_date DESC
    LIMIT ?
  `, [limit]);
}

export async function upsertPR(
  exerciseId: number,
  maxWeight: number,
  maxReps: number,
  maxVolume: number,
  achievedDate: string,
  workoutId: number
): Promise<void> {
  const existing = await getPRForExercise(exerciseId);
  if (!existing) {
    await getDB().runAsync(
      `INSERT INTO personal_records
        (exercise_id, max_weight, max_reps, max_volume, achieved_date, workout_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [exerciseId, maxWeight, maxReps, maxVolume, achievedDate, workoutId]
    );
  } else {
    const newWeight = Math.max(existing.max_weight, maxWeight);
    const newReps   = Math.max(existing.max_reps,   maxReps);
    const newVolume = Math.max(existing.max_volume,  maxVolume);
    // only update date if something actually improved
    const improved = newWeight > existing.max_weight || newReps > existing.max_reps || newVolume > existing.max_volume;
    await getDB().runAsync(
      `UPDATE personal_records
       SET max_weight = ?, max_reps = ?, max_volume = ?,
           achieved_date = ?, workout_id = ?
       WHERE exercise_id = ?`,
      [
        newWeight, newReps, newVolume,
        improved ? achievedDate : existing.achieved_date,
        improved ? workoutId   : existing.workout_id,
        exerciseId,
      ]
    );
  }
}

// Returns which records were broken: { weight, reps, volume }
export async function detectAndSavePRs(
  exerciseId: number,
  sets: { weight: number; reps: number }[],
  workoutId: number,
  workoutDate: string
): Promise<{ weight: boolean; reps: boolean; volume: boolean }> {
  const maxWeight = Math.max(...sets.map(s => s.weight));
  const maxReps   = Math.max(...sets.map(s => s.reps));
  const maxVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

  const existing = await getPRForExercise(exerciseId);
  const broken = {
    weight: maxWeight > (existing?.max_weight ?? 0),
    reps:   maxReps   > (existing?.max_reps   ?? 0),
    volume: maxVolume > (existing?.max_volume  ?? 0),
  };

  await upsertPR(exerciseId, maxWeight, maxReps, maxVolume, workoutDate, workoutId);
  return broken;
}
