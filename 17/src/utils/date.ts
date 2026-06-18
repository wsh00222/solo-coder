import { format, parseISO, differenceInDays, addDays, isToday, isPast, isFuture } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: zhCN });
}

export function formatDateCN(date: string): string {
  return formatDate(date, 'yyyy年MM月dd日');
}

export function formatShortDate(date: string): string {
  return formatDate(date, 'MM/dd');
}

export function formatDateShort(date: string): string {
  return formatShortDate(date);
}

export function daysBetween(date1: string, date2: string): number {
  return Math.abs(differenceInDays(parseISO(date1), parseISO(date2)));
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDateNDaysAgo(n: number): string {
  return format(addDays(new Date(), -n), 'yyyy-MM-dd');
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function isPastDate(dateStr: string): boolean {
  return isPast(parseISO(dateStr));
}

export function isFutureDate(dateStr: string): boolean {
  return isFuture(parseISO(dateStr));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}

export function getMonthDaysCount(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
