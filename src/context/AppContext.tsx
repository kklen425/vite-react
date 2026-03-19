import { createContext, useContext, type ReactNode } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useUserPrefs } from '../hooks/useUserPrefs';
import { useBodyMetrics } from '../hooks/useBodyMetrics';
import { useCustomExercises } from '../hooks/useCustomExercises';

type WorkoutsHook = ReturnType<typeof useWorkouts>;
type PrefsHook = ReturnType<typeof useUserPrefs>;
type MetricsHook = ReturnType<typeof useBodyMetrics>;
type CustomExHook = ReturnType<typeof useCustomExercises>;

interface AppContextValue {
  workouts: WorkoutsHook;
  prefs: PrefsHook;
  metrics: MetricsHook;
  customExercises: CustomExHook;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const workouts = useWorkouts();
  const prefs = useUserPrefs();
  const metrics = useBodyMetrics();
  const customExercises = useCustomExercises();

  return (
    <AppContext.Provider value={{ workouts, prefs, metrics, customExercises }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
