export const FEELING_MAP: Record<number, string> = {
  1: '很糟糕',
  2: '较差',
  3: '一般',
  4: '不错',
  5: '很棒',
};

export const GOAL_COLORS: Record<string, { bg: string; bar: string; text: string; border: string }> = {
  '增肌': {
    bg: 'bg-blue-50',
    bar: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  '减脂': {
    bg: 'bg-orange-50',
    bar: 'bg-orange-500',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  '保持': {
    bg: 'bg-green-50',
    bar: 'bg-green-500',
    text: 'text-green-600',
    border: 'border-green-200',
  },
};

export const GOAL_GOLD = 'bg-yellow-500';

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysStr(s: string, days: number): string {
  const d = parseDateStr(s);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function diffDaysStr(s1: string, s2: string): number {
  const d1 = parseDateStr(s1);
  const d2 = parseDateStr(s2);
  const ms = d2.getTime() - d1.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function getWeekStartStr(s: string): string {
  const d = parseDateStr(s);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

export function getWeekEndStr(s: string): string {
  return addDaysStr(getWeekStartStr(s), 6);
}

export function shortDate(s: string): string {
  const d = parseDateStr(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function weekdayStr(s: string): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[parseDateStr(s).getDay()];
}
