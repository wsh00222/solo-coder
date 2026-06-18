import { parseISO } from 'date-fns';
import { getToday } from './date';

function addDaysStr(dateStr: string, days: number): string {
  const date = parseISO(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function calculateCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort().reverse();
  const today = getToday();

  let streak = 0;
  let checkDate = today;

  if (sortedDates[0] !== today) {
    checkDate = addDaysStr(today, -1);
  }

  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i] === checkDate) {
      streak++;
      checkDate = addDaysStr(checkDate, -1);
    } else if (sortedDates[i] < checkDate) {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1] + 'T00:00:00');
    const curr = parseISO(sortedDates[i] + 'T00:00:00');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  return longest;
}

export function calculateDaysSinceLastStudy(dates: string[]): number {
  if (dates.length === 0) return 999;

  const sortedDates = [...dates].sort().reverse();
  const lastStudyDate = sortedDates[0];
  const today = getToday();

  const lastDate = parseISO(lastStudyDate + 'T00:00:00');
  const todayDate = parseISO(today + 'T00:00:00');
  return Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}
