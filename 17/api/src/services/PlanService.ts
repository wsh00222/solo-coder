import { PlanRepository } from '../repositories/PlanRepository.js';
import { RecordRepository } from '../repositories/RecordRepository.js';
import type {
  Plan,
  PlanWithStats,
  CreatePlanDto,
  UpdatePlanDto,
} from '../../../shared/types.js';
import { daysBetween, isPast, getToday } from '../utils/dateUtils.js';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateDaysSinceLastStudy,
} from '../utils/streakUtils.js';

export const PlanService = {
  async getAllPlans(options?: {
    status?: 'all' | 'active' | 'completed';
    sortBy?: 'startDate' | 'endDate' | 'name';
    search?: string;
  }): Promise<PlanWithStats[]> {
    const plans = PlanRepository.findAll(options);
    return Promise.all(plans.map((plan) => this.enrichPlanWithStats(plan)));
  },

  async getPlanById(id: number): Promise<PlanWithStats | null> {
    const plan = PlanRepository.findById(id);
    if (!plan) return null;
    return this.enrichPlanWithStats(plan);
  },

  async createPlan(data: CreatePlanDto): Promise<PlanWithStats> {
    if (data.startDate > data.endDate) {
      throw new Error('开始日期不能晚于结束日期');
    }
    if (data.dailyGoalMinutes <= 0) {
      throw new Error('每日学习时长必须大于0');
    }
    const plan = PlanRepository.create(data);
    return this.enrichPlanWithStats(plan);
  },

  async updatePlan(id: number, data: UpdatePlanDto): Promise<PlanWithStats | null> {
    const existingPlan = PlanRepository.findById(id);
    if (!existingPlan) return null;

    if (data.endDate !== undefined) {
      if (data.endDate < existingPlan.startDate) {
        throw new Error('结束日期不能早于开始日期');
      }
      if (data.endDate < getToday()) {
        throw new Error('结束日期不能早于今天');
      }
    }

    if (data.dailyGoalMinutes !== undefined && data.dailyGoalMinutes <= 0) {
      throw new Error('每日学习时长必须大于0');
    }

    const plan = PlanRepository.update(id, data);
    if (!plan) return null;
    return this.enrichPlanWithStats(plan);
  },

  async deletePlan(id: number): Promise<boolean> {
    return PlanRepository.delete(id);
  },

  async enrichPlanWithStats(plan: Plan): Promise<PlanWithStats> {
    const records = RecordRepository.getDistinctDatesByPlanId(plan.id);
    const totalDays = daysBetween(plan.startDate, plan.endDate) + 1;
    const studiedDays = records.length;
    const progress = totalDays > 0 ? Math.round((studiedDays / totalDays) * 100) : 0;
    const currentStreak = calculateCurrentStreak(records);
    const longestStreak = calculateLongestStreak(records);
    const daysSinceLastStudy = calculateDaysSinceLastStudy(records);
    const status = isPast(plan.endDate) ? 'completed' : 'active';

    return {
      ...plan,
      totalDays,
      studiedDays,
      progress,
      currentStreak,
      longestStreak,
      daysSinceLastStudy,
      status,
    };
  },
};
