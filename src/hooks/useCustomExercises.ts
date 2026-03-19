import { useState, useCallback } from 'react';
import type { CustomExercise } from '../types';
import { loadCustomExercises, saveCustomExercises } from '../utils/storage';
import { genId } from '../utils/id';

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>(loadCustomExercises);

  const addCustomExercise = useCallback((name: string, bodyPart: string) => {
    const next: CustomExercise = { id: genId(), name, bodyPart };
    setCustomExercises(prev => {
      const arr = [...prev, next];
      saveCustomExercises(arr);
      return arr;
    });
  }, []);

  const deleteCustomExercise = useCallback((id: string) => {
    setCustomExercises(prev => {
      const arr = prev.filter(e => e.id !== id);
      saveCustomExercises(arr);
      return arr;
    });
  }, []);

  return { customExercises, addCustomExercise, deleteCustomExercise };
}
