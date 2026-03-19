import * as SQLite from 'expo-sqlite';
import { SEED_EXERCISES } from '../constants/exercises';

let db: SQLite.SQLiteDatabase;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('fitness.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDB();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS exercises (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      body_part   TEXT NOT NULL,
      is_custom   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT NOT NULL,
      body_parts  TEXT NOT NULL DEFAULT '[]',
      notes       TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id   INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
      exercise_id  INTEGER NOT NULL REFERENCES exercises(id),
      order_index  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sets (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_exercise_id  INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
      set_number           INTEGER NOT NULL,
      weight               REAL    NOT NULL DEFAULT 0,
      reps                 INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS personal_records (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id    INTEGER NOT NULL REFERENCES exercises(id),
      max_weight     REAL    NOT NULL DEFAULT 0,
      max_reps       INTEGER NOT NULL DEFAULT 0,
      max_volume     REAL    NOT NULL DEFAULT 0,
      achieved_date  TEXT    NOT NULL,
      workout_id     INTEGER NOT NULL REFERENCES workouts(id)
    );

    CREATE TABLE IF NOT EXISTS body_metrics (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      date          TEXT    NOT NULL UNIQUE,
      weight        REAL    NOT NULL,
      body_fat_pct  REAL,
      waist_cm      REAL
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      id                      INTEGER PRIMARY KEY DEFAULT 1,
      goal                    TEXT    NOT NULL DEFAULT '健體',
      training_days_per_week  INTEGER NOT NULL DEFAULT 3,
      experience              TEXT    NOT NULL DEFAULT '新手',
      rest_timer_default      INTEGER NOT NULL DEFAULT 90,
      notification_enabled    INTEGER NOT NULL DEFAULT 0,
      notification_time       TEXT    NOT NULL DEFAULT '08:00',
      onboarding_completed    INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO user_profile (id) VALUES (1);
  `);

  await seedExercises(database);
}

async function seedExercises(database: SQLite.SQLiteDatabase): Promise<void> {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises WHERE is_custom = 0'
  );
  if (existing && existing.count > 0) return;

  await database.withTransactionAsync(async () => {
    for (const ex of SEED_EXERCISES) {
      await database.runAsync(
        'INSERT INTO exercises (name, body_part, is_custom) VALUES (?, ?, 0)',
        [ex.name, ex.body_part]
      );
    }
  });
}
