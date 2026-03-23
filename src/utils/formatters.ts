import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return '今日';
  if (isYesterday(date)) return '昨日';
  return format(date, 'M月d日 (EEE)', { locale: zhTW });
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'M/d');
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy年M月d日 EEEE', { locale: zhTW });
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatWeight(w: number): string {
  return w % 1 === 0 ? `${w}` : `${w.toFixed(1)}`;
}

export function formatVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${v}`;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function daysAgo(dateStr: string): number {
  return differenceInDays(new Date(), parseISO(dateStr));
}

export function parseBodyParts(json: string): string[] {
  try { return JSON.parse(json); }
  catch { return []; }
}
