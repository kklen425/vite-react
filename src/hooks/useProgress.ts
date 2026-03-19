import { useEffect, useState, useCallback } from 'react';
import { getProgressForExercise } from '../db/repositories/progressRepo';
import type { ProgressPoint, OverloadSuggestion } from '../types';

export function useExerciseProgress(exerciseId: number | null) {
  const [points,  setPoints]  = useState<ProgressPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!exerciseId) { setPoints([]); return; }
    setLoading(true);
    const data = await getProgressForExercise(exerciseId);
    setPoints(data);
    setLoading(false);
  }, [exerciseId]);

  useEffect(() => { load(); }, [load]);

  return { points, loading, refresh: load };
}

// Pro-only: rules-based progressive overload suggestion
export function getOverloadSuggestion(
  sets: { weight: number; reps: number }[],
  targetRepMin = 8,
  targetRepMax = 12
): OverloadSuggestion {
  if (sets.length === 0) {
    return { suggestion: 'maintain', message: '沒有足夠數據' };
  }

  const allHitTop  = sets.every(s => s.reps >= targetRepMax);
  const mostMissed = sets.filter(s => s.reps < targetRepMin).length > sets.length / 2;

  if (allHitTop) {
    return {
      suggestion: 'increase',
      message: `每組都達到 ${targetRepMax} 下，建議下次加重 2.5kg 💪`,
    };
  }
  if (mostMissed) {
    return {
      suggestion: 'decrease',
      message: `大部分組別未達 ${targetRepMin} 下，保持或減輕重量穩固技術`,
    };
  }
  return {
    suggestion: 'maintain',
    message: `繼續保持目前重量，爭取每組達到 ${targetRepMax} 下`,
  };
}
