import { PlanModel } from '../models/Plan';
import { RecordModel, Record, RecordFilters } from '../models/Record';
import { getServerDate, addDays, diffDays, getMonthStart, getMonthEnd, getWeekStart, getWeekEnd, getDatesBetween } from '../utils/date';

export interface GlobalStats {
  total_plans: number;
  month_records_count: number;
  month_duration_hours: number;
  current_streak_days: number;
  days_without_training: number;
}

export interface ReminderLevel {
  level: 'none' | 'warning' | 'danger';
  message: string | null;
}

export const StatsService = {
  async getGlobal(filters?: RecordFilters & { planId?: number }): Promise<GlobalStats> {
    const totalPlans = await PlanModel.count();
    const today = getServerDate();
    const monthStart = getMonthStart(today);
    const monthEnd = getMonthEnd(today);

    const monthFilters: RecordFilters & { planId?: number } = {
      ...filters,
      startDate: filters?.startDate && filters.startDate > monthStart ? filters.startDate : monthStart,
      endDate: filters?.endDate && filters.endDate < monthEnd ? filters.endDate : monthEnd,
    };

    const monthRecords = await RecordModel.getAll(monthFilters);
    const monthRecordsCount = monthRecords.length;
    const monthDuration = monthRecords.reduce((sum, r) => sum + r.duration, 0);
    const monthDurationHours = Math.round((monthDuration / 60) * 10) / 10;

    const allDates = new Set(await RecordModel.getAllDates());
    const currentStreak = this.calcCurrentStreak(allDates, today);
    const daysWithout = this.calcDaysWithoutTraining(allDates, today);

    return {
      total_plans: totalPlans,
      month_records_count: monthRecordsCount,
      month_duration_hours: monthDurationHours,
      current_streak_days: currentStreak,
      days_without_training: daysWithout,
    };
  },

  async getReminder(): Promise<ReminderLevel> {
    const allDates = new Set(await RecordModel.getAllDates());
    const today = getServerDate();
    const daysWithout = this.calcDaysWithoutTraining(allDates, today);
    if (daysWithout >= 5) {
      return { level: 'danger', message: `已连续 ${daysWithout} 天未训练，请尽快恢复！` };
    } else if (daysWithout >= 3) {
      return { level: 'warning', message: `您已连续 ${daysWithout} 天未训练，加油哦！` };
    }
    return { level: 'none', message: null };
  },

  calcDaysWithoutTraining(dates: Set<string>, today: string): number {
    let count = 0;
    let d = today;
    while (!dates.has(d)) {
      count++;
      d = addDays(d, -1);
      if (count > 365) break;
    }
    return count;
  },

  calcCurrentStreak(dates: Set<string>, today: string): number {
    let streak = 0;
    let d = today;
    if (!dates.has(d)) {
      d = addDays(d, -1);
      if (!dates.has(d)) return 0;
    }
    while (dates.has(d)) {
      streak++;
      d = addDays(d, -1);
    }
    return streak;
  },

  async getLast7DaysChart(planId?: number): Promise<{ date: string; duration: number }[]> {
    const today = getServerDate();
    const start = addDays(today, -6);
    const dates = getDatesBetween(start, today);
    const filters: RecordFilters & { planId?: number } = {
      startDate: start,
      endDate: today,
    };
    if (planId) filters.planId = planId;
    const records = await RecordModel.getAll(filters);

    const map = new Map<string, number>();
    for (const r of records) {
      map.set(r.date, (map.get(r.date) || 0) + r.duration);
    }
    return dates.map(d => ({ date: d, duration: map.get(d) || 0 }));
  },
};
