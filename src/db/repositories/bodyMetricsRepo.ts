import { getDB } from '../database';
import type { BodyMetrics } from '../../types';

export async function getAllBodyMetrics(): Promise<BodyMetrics[]> {
  return getDB().getAllAsync<BodyMetrics>(
    'SELECT * FROM body_metrics ORDER BY date DESC'
  );
}

export async function getBodyMetricsByDate(date: string): Promise<BodyMetrics | null> {
  return getDB().getFirstAsync<BodyMetrics>(
    'SELECT * FROM body_metrics WHERE date = ?', [date]
  );
}

export async function upsertBodyMetrics(
  date: string,
  weight: number,
  bodyFatPct: number | null,
  waistCm: number | null
): Promise<void> {
  await getDB().runAsync(`
    INSERT INTO body_metrics (date, weight, body_fat_pct, waist_cm)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      weight = excluded.weight,
      body_fat_pct = excluded.body_fat_pct,
      waist_cm = excluded.waist_cm
  `, [date, weight, bodyFatPct, waistCm]);
}

export async function deleteBodyMetrics(id: number): Promise<void> {
  await getDB().runAsync('DELETE FROM body_metrics WHERE id = ?', [id]);
}

export async function getLatestBodyMetrics(): Promise<BodyMetrics | null> {
  return getDB().getFirstAsync<BodyMetrics>(
    'SELECT * FROM body_metrics ORDER BY date DESC LIMIT 1'
  );
}
