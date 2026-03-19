import type { Workout, PersonalRecord, WorkoutExercise } from '../types';

export function computePRs(workouts: Workout[]): PersonalRecord[] {
  const map = new Map<string, PersonalRecord>();
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

  for (const workout of sorted) {
    for (const ex of workout.exercises) {
      for (const set of ex.sets) {
        const vol = set.weight * set.reps;
        const key = ex.exerciseName;
        const existing = map.get(key);
        if (!existing || set.weight > existing.weight || vol > existing.volume) {
          map.set(key, {
            exerciseName: key,
            weight: Math.max(set.weight, existing?.weight ?? 0),
            volume: Math.max(vol, existing?.volume ?? 0),
            date: workout.date,
            workoutId: workout.id,
          });
        }
      }
    }
  }
  return Array.from(map.values());
}

export function detectNewPRs(
  exercise: WorkoutExercise,
  existingPRs: PersonalRecord[],
  workoutId: string,
  date: string
): { updatedPRs: PersonalRecord[]; newPRExercise: string | null } {
  const existing = existingPRs.find(p => p.exerciseName === exercise.exerciseName);
  let updatedPRs = [...existingPRs];
  let isNewPR = false;

  for (const set of exercise.sets) {
    const vol = set.weight * set.reps;
    if (!existing || set.weight > existing.weight || vol > existing.volume) {
      const newPR: PersonalRecord = {
        exerciseName: exercise.exerciseName,
        weight: Math.max(set.weight, existing?.weight ?? 0),
        volume: Math.max(vol, existing?.volume ?? 0),
        date,
        workoutId,
      };
      if (!existing) {
        updatedPRs.push(newPR);
      } else {
        updatedPRs = updatedPRs.map(p =>
          p.exerciseName === exercise.exerciseName ? newPR : p
        );
      }
      isNewPR = true;
      break;
    }
  }

  return { updatedPRs, newPRExercise: isNewPR ? exercise.exerciseName : null };
}
