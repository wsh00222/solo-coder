export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function daysBetween(date1: string, date2: string): number {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

export function isPast(dateStr: string): boolean {
  return dateStr < formatDate(new Date());
}

export function isFuture(dateStr: string): boolean {
  return dateStr > formatDate(new Date());
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return formatDate(date);
}
