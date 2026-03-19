import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Workout, WorkoutExercise } from '../types';
import {
  loadWorkouts, saveWorkouts, loadPRs, savePRs,
} from '../utils/storage';
import { migrate } from '../utils/storage';
import { detectNewPRs } from '../utils/pr';
import { todayISO } from '../utils/dates';
import { genId } from '../utils/id';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [prs, setPRs] = useState(loadPRs());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    migrate();
    const data = loadWorkouts();
    setWorkouts(data.sort((a, b) => b.date.localeCompare(a.date)));
    setPRs(loadPRs());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Workout[]) => {
    const sorted = [...next].sort((a, b) => b.date.localeCompare(a.date));
    setWorkouts(sorted);
    saveWorkouts(sorted);
  }, []);

  const saveWorkout = useCallback(
    (exercises: WorkoutExercise[], date: string = todayISO()): { workoutId: string; newPRExercise: string | null } => {
      const workoutId = genId();
      let updatedPRs = [...prs];
      let newPRExercise: string | null = null;

      const processedExercises = exercises.map(ex => {
        const { updatedPRs: next, newPRExercise: prEx } = detectNewPRs(ex, updatedPRs, workoutId, date);
        updatedPRs = next;
        if (prEx && !newPRExercise) newPRExercise = prEx;
        return ex;
      });

      const workout: Workout = { id: workoutId, date, exercises: processedExercises };
      persist([workout, ...workouts]);
      setPRs(updatedPRs);
      savePRs(updatedPRs);

      return { workoutId, newPRExercise };
    },
    [workouts, prs, persist]
  );

  const deleteWorkout = useCallback(
    (id: string) => persist(workouts.filter(w => w.id !== id)),
    [workouts, persist]
  );

  // Derived stats
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let weeklyCount = 0;
    let monthlyCount = 0;
    let streak = 0;
    let prevDate = '';
    const today = todayISO();

    const dateSet = new Set(workouts.map(w => w.date));
    const sorted = [...dateSet].sort((a, b) => b.localeCompare(a));

    for (const d of sorted) {
      const date = new Date(d + 'T00:00:00');
      if (date >= weekStart) weeklyCount++;
      if (date >= monthStart) monthlyCount++;
    }

    // streak: consecutive days ending today or yesterday
    for (const d of sorted) {
      if (streak === 0) {
        const diff = Math.floor((new Date(today + 'T00:00:00').getTime() - new Date(d + 'T00:00:00').getTime()) / 86400000);
        if (diff > 1) break;
      } else {
        const prev = new Date(prevDate + 'T00:00:00');
        const curr = new Date(d + 'T00:00:00');
        const diff = Math.floor((prev.getTime() - curr.getTime()) / 86400000);
        if (diff !== 1) break;
      }
      streak++;
      prevDate = d;
    }

    return { weeklyCount, monthlyCount, streak };
  }, [workouts]);

  const recentWorkouts = useMemo(() => workouts.slice(0, 5), [workouts]);

  const getWorkout = useCallback(
    (id: string) => workouts.find(w => w.id === id),
    [workouts]
  );

  // Progress data for a given exercise
  const getExerciseProgress = useCallback(
    (exerciseName: string) =>
      workouts
        .filter(w => w.exercises.some(e => e.exerciseName === exerciseName))
        .map(w => {
          const ex = w.exercises.find(e => e.exerciseName === exerciseName)!;
          const maxWeight = Math.max(...ex.sets.map(s => s.weight));
          const volume = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
          return { date: w.date, weight: maxWeight, volume };
        })
        .reverse(),
    [workouts]
  );

  const allExerciseNames = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(e => names.add(e.exerciseName)));
    return Array.from(names);
  }, [workouts]);

  return {
    workouts, prs, loaded, stats, recentWorkouts,
    saveWorkout, deleteWorkout, getWorkout,
    getExerciseProgress, allExerciseNames,
  };
}
