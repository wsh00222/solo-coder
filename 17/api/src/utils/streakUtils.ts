import { parseDate, getToday, daysBetween, addDays } from './dateUtils.js';

export function calculateCurrentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates].sort().reverse();
  const today = getToday();

  let streak = 0;
  let checkDate = today;

  if (sortedDates[0] !== today) {
    checkDate = addDays(today, -1);
  }

  for (let i = 0; i < sortedDates.length; i++) {
    if (sortedDates[i] === checkDate) {
      streak++;
      checkDate = addDays(checkDate, -1);
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
    const prev = parseDate(sortedDates[i - 1]);
    const curr = parseDate(sortedDates[i]);
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

  return daysBetween(lastStudyDate, today);
}

export function calculateLongestGlobalStreak(allDates: string[][]): number {
  let longest = 0;
  for (const dates of allDates) {
    longest = Math.max(longest, calculateLongestStreak(dates));
  }
  return longest;
}
