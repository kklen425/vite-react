import { useCallback, useEffect, useState } from 'react';
import { getAllPRs, getRecentPRs, detectAndSavePRs } from '../db/repositories/prRepo';
import type { PersonalRecord, PRAlert } from '../types';

export function useRecentPRs(limit = 5) {
  const [prs,     setPRs]     = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getRecentPRs(limit);
    setPRs(data);
    setLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  return { prs, loading, refresh: load };
}

export function useAllPRs() {
  const [prs,     setPRs]     = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setPRs(await getAllPRs());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { prs, loading, refresh: load };
}

export async function runPRDetection(
  workoutId: number,
  workoutDate: string,
  exercises: Array<{
    exercise_id: number;
    exercise_name: string;
    sets: { weight: number; reps: number }[];
  }>
): Promise<PRAlert[]> {
  const alerts: PRAlert[] = [];

  for (const ex of exercises) {
    if (ex.sets.length === 0) continue;
    const broken = await detectAndSavePRs(
      ex.exercise_id,
      ex.sets,
      workoutId,
      workoutDate
    );
    const maxWeight = Math.max(...ex.sets.map(s => s.weight));
    const maxReps   = Math.max(...ex.sets.map(s => s.reps));
    const volume    = ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

    if (broken.weight) alerts.push({ exerciseName: ex.exercise_name, type: 'weight', value: maxWeight });
    else if (broken.volume) alerts.push({ exerciseName: ex.exercise_name, type: 'volume', value: volume });
    else if (broken.reps) alerts.push({ exerciseName: ex.exercise_name, type: 'reps', value: maxReps });
  }

  return alerts;
}
