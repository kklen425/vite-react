import type { Workout, UserPrefs, PersonalRecord, BodyMetricEntry, CustomExercise, LegacyWorkoutRecord } from '../types';
import { LEGACY_BODY_PART_MAP } from '../constants/exercises';
import { computePRs } from './pr';
import { genId } from './id';

const KEYS = {
  workouts: 'fittrack-workouts',
  prefs: 'fittrack-prefs',
  prs: 'fittrack-prs',
  metrics: 'fittrack-metrics',
  customExercises: 'fittrack-custom-exercises',
  migrated: 'fittrack-migrated',
  legacy: 'fitness-tracker-records',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// --- Workouts ---
export function loadWorkouts(): Workout[] {
  return get<Workout[]>(KEYS.workouts, []);
}
export function saveWorkouts(workouts: Workout[]) {
  set(KEYS.workouts, workouts);
}

// --- Prefs ---
const DEFAULT_PREFS: UserPrefs = {
  onboardingComplete: false,
  goal: null,
  frequency: null,
  experience: null,
  isPro: false,
  restTimerSeconds: 90,
};
export function loadPrefs(): UserPrefs {
  return { ...DEFAULT_PREFS, ...get<Partial<UserPrefs>>(KEYS.prefs, {}) };
}
export function savePrefs(prefs: UserPrefs) {
  set(KEYS.prefs, prefs);
}

// --- PRs ---
export function loadPRs(): PersonalRecord[] {
  return get<PersonalRecord[]>(KEYS.prs, []);
}
export function savePRs(prs: PersonalRecord[]) {
  set(KEYS.prs, prs);
}

// --- Body Metrics ---
export function loadMetrics(): BodyMetricEntry[] {
  return get<BodyMetricEntry[]>(KEYS.metrics, []);
}
export function saveMetrics(metrics: BodyMetricEntry[]) {
  set(KEYS.metrics, metrics);
}

// --- Custom Exercises ---
export function loadCustomExercises(): CustomExercise[] {
  return get<CustomExercise[]>(KEYS.customExercises, []);
}
export function saveCustomExercises(exercises: CustomExercise[]) {
  set(KEYS.customExercises, exercises);
}

// --- Migration ---
export function migrate(): boolean {
  if (localStorage.getItem(KEYS.migrated)) return false;

  const legacy = get<LegacyWorkoutRecord[]>(KEYS.legacy, []);
  if (legacy.length === 0) {
    localStorage.setItem(KEYS.migrated, '1');
    return false;
  }

  // Group by date
  const byDate: Record<string, LegacyWorkoutRecord[]> = {};
  for (const r of legacy) {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  }

  const workouts: Workout[] = Object.entries(byDate).map(([date, records]) => ({
    id: genId(),
    date,
    exercises: records.map(r => ({
      id: genId(),
      exerciseName: r.exercise,
      bodyPart: LEGACY_BODY_PART_MAP[r.bodyPart] ?? r.bodyPart,
      sets: Array.from({ length: r.sets }, () => ({
        id: genId(),
        weight: r.weight,
        reps: r.reps,
        completed: true,
      })),
    })),
  }));

  saveWorkouts(workouts);
  savePRs(computePRs(workouts));
  localStorage.setItem(KEYS.migrated, '1');
  return true;
}
