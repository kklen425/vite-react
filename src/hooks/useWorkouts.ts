import { useCallback, useEffect, useState } from 'react';
import {
  getWorkouts,
  getWorkoutById,
  getWorkoutExercises,
  getSetsForWorkoutExercise,
  getWorkoutCount,
} from '../db/repositories/workoutRepo';
import type { Workout, WorkoutExercise, WorkoutSet } from '../types';

export function useWorkoutList(limitDays?: number) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getWorkouts(limitDays);
    setWorkouts(data);
    setLoading(false);
  }, [limitDays]);

  useEffect(() => { load(); }, [load]);

  return { workouts, loading, refresh: load };
}

export function useWorkoutDetail(workoutId: number) {
  const [workout,   setWorkout]   = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [setsMap,   setSetsMap]   = useState<Record<number, WorkoutSet[]>>({});
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const w  = await getWorkoutById(workoutId);
    const ex = await getWorkoutExercises(workoutId);
    const map: Record<number, WorkoutSet[]> = {};
    for (const e of ex) {
      map[e.id] = await getSetsForWorkoutExercise(e.id);
    }
    setWorkout(w);
    setExercises(ex);
    setSetsMap(map);
    setLoading(false);
  }, [workoutId]);

  useEffect(() => { load(); }, [load]);

  return { workout, exercises, setsMap, loading, refresh: load };
}

export function useWorkoutCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    getWorkoutCount().then(setCount);
  }, []);
  return count;
}
