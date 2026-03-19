import { useState, useCallback } from 'react';
import type { BodyMetricEntry } from '../types';
import { loadMetrics, saveMetrics } from '../utils/storage';
import { genId } from '../utils/id';
import { todayISO } from '../utils/dates';

export function useBodyMetrics() {
  const [metrics, setMetrics] = useState<BodyMetricEntry[]>(loadMetrics);

  const addMetric = useCallback((entry: Omit<BodyMetricEntry, 'id' | 'date'> & { date?: string }) => {
    const newEntry: BodyMetricEntry = {
      id: genId(),
      date: entry.date ?? todayISO(),
      weight: entry.weight,
      bodyFat: entry.bodyFat,
      waist: entry.waist,
    };
    setMetrics(prev => {
      const next = [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      saveMetrics(next);
      return next;
    });
  }, []);

  const deleteMetric = useCallback((id: string) => {
    setMetrics(prev => {
      const next = prev.filter(m => m.id !== id);
      saveMetrics(next);
      return next;
    });
  }, []);

  return { metrics, addMetric, deleteMetric };
}
