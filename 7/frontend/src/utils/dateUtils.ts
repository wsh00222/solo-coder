export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getToday = (): string => formatDate(new Date());

export const getDateNDaysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

export const isDateWithinNDays = (dateStr: string, n: number): boolean => {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= n;
};

export const isDateInFuture = (dateStr: string): boolean => {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target.getTime() > today.getTime();
};

export const formatDisplayDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const getChineseWeekday = (dateStr: string): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(dateStr);
  return weekdays[d.getDay()];
};

export const getMinBackfillDate = (): string => {
  return getDateNDaysAgo(7);
};

export const getDatePickerRange = (): { min: string; max: string } => {
  return {
    min: getMinBackfillDate(),
    max: getToday(),
  };
};

export const parseDateToYearMonthDay = (dateStr: string): { year: number; month: number; day: number } => {
  const d = new Date(dateStr);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return formatDate(date1) === formatDate(date2);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getPastThreeMonthsDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 3);
  startDate.setDate(startDate.getDate() + 1);

  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getWeekStartDates = (): { label: string; date: string }[] => {
  return [];
};
