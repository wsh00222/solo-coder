export function getServerDate(): string {
  const now = new Date();
  return formatDate(now);
}

export function getServerDateTime(): string {
  const now = new Date();
  return formatDateTime(now);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateTime(date: Date): string {
  const dateStr = formatDate(date);
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dateStr} ${h}:${min}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDays(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  const ms = d2.getTime() - d1.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function getWeekStart(dateStr: string): string {
  const d = parseDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

export function getWeekEnd(dateStr: string): string {
  const weekStart = getWeekStart(dateStr);
  return addDays(weekStart, 6);
}

export function isSameWeek(dateStr1: string, dateStr2: string): boolean {
  return getWeekStart(dateStr1) === getWeekStart(dateStr2);
}

export function getMonthStart(dateStr: string): string {
  const d = parseDate(dateStr);
  d.setDate(1);
  return formatDate(d);
}

export function getMonthEnd(dateStr: string): string {
  const d = parseDate(dateStr);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return formatDate(d);
}

export function getDatesBetween(start: string, end: string): string[] {
  const result: string[] = [];
  let current = start;
  while (current <= end) {
    result.push(current);
    current = addDays(current, 1);
  }
  return result;
}
