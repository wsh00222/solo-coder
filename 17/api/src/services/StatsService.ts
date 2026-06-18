import { PlanRepository } from '../repositories/PlanRepository.js';
import { RecordRepository } from '../repositories/RecordRepository.js';
import type { StatsOverview, Alert } from '../../../shared/types.js';
import { calculateDaysSinceLastStudy, calculateLongestGlobalStreak } from '../utils/streakUtils.js';
import { isPast } from '../utils/dateUtils.js';

export const StatsService = {
  async getOverview(): Promise<StatsOverview> {
    const totalPlans = PlanRepository.countAll();
    const activePlans = PlanRepository.countActive();
    const todayStudyMinutes = RecordRepository.getTodayTotalMinutes();
    const monthStudyDays = RecordRepository.getMonthStudyDays();

    const allPlans = PlanRepository.findAll();
    const allDates = allPlans.map((plan) =>
      RecordRepository.getDistinctDatesByPlanId(plan.id)
    );
    const longestGlobalStreak = calculateLongestGlobalStreak(allDates);

    return {
      totalPlans,
      activePlans,
      todayStudyMinutes,
      monthStudyDays,
      longestGlobalStreak,
    };
  },

  async getAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const allPlans = PlanRepository.findAll({ status: 'active' });

    for (const plan of allPlans) {
      if (isPast(plan.endDate)) continue;

      const dates = RecordRepository.getDistinctDatesByPlanId(plan.id);
      const daysSince = calculateDaysSinceLastStudy(dates);

      if (daysSince >= 5) {
        alerts.push({
          planId: plan.id,
          planName: plan.name,
          days: daysSince,
          severity: 'danger',
        });
      } else if (daysSince >= 3) {
        alerts.push({
          planId: plan.id,
          planName: plan.name,
          days: daysSince,
          severity: 'warning',
        });
      }
    }

    return alerts.sort((a, b) => b.days - a.days);
  },
};
