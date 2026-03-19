const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `週${WEEKDAYS[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

export function daysAgo(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

export function relativeDateLabel(dateStr: string): string {
  const ago = daysAgo(dateStr);
  if (ago === 0) return '今日';
  if (ago === 1) return '昨日';
  if (ago < 7) return `${ago}日前`;
  return formatDate(dateStr);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return '早晨 ☀️';
  if (h < 18) return '下晝 🌤️';
  return '晚上 🌙';
}

export function isThisWeek(dateStr: string): boolean {
  return daysAgo(dateStr) < 7;
}

export function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
