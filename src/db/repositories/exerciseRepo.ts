import { getDB } from '../database';
import type { Exercise, BodyPart } from '../../types';

export async function getAllExercises(): Promise<Exercise[]> {
  return getDB().getAllAsync<Exercise>(
    'SELECT * FROM exercises ORDER BY body_part, name'
  );
}

export async function getExercisesByBodyPart(bodyPart: BodyPart): Promise<Exercise[]> {
  return getDB().getAllAsync<Exercise>(
    'SELECT * FROM exercises WHERE body_part = ? ORDER BY name',
    [bodyPart]
  );
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  return getDB().getFirstAsync<Exercise>(
    'SELECT * FROM exercises WHERE id = ?', [id]
  );
}

export async function createCustomExercise(name: string, bodyPart: BodyPart): Promise<number> {
  const result = await getDB().runAsync(
    'INSERT INTO exercises (name, body_part, is_custom) VALUES (?, ?, 1)',
    [name, bodyPart]
  );
  return result.lastInsertRowId;
}

export async function deleteCustomExercise(id: number): Promise<void> {
  await getDB().runAsync(
    'DELETE FROM exercises WHERE id = ? AND is_custom = 1', [id]
  );
}

export async function countCustomExercises(): Promise<number> {
  const row = await getDB().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises WHERE is_custom = 1'
  );
  return row?.count ?? 0;
}
