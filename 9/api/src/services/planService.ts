import { PlanModel } from '../models/Plan';
import { ItineraryModel } from '../models/Itinerary';
import type { Plan, PlanWithItineraries, CreatePlanRequest, UpdatePlanRequest } from '@shared/types';

export const planService = {
  getAllPlans(): Plan[] {
    return PlanModel.findAll();
  },

  getPlanById(id: string): PlanWithItineraries | null {
    const plan = PlanModel.findById(id);
    if (!plan) return null;
    
    const itineraries = ItineraryModel.findByPlanId(id);
    return { ...plan, itineraries };
  },

  createPlan(data: CreatePlanRequest): Plan {
    if (!data.destination.trim()) {
      throw new Error('目的地不能为空');
    }
    if (!data.startDate || !data.endDate) {
      throw new Error('出发日期和返回日期不能为空');
    }
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new Error('出发日期不能晚于返回日期');
    }
    return PlanModel.create(data);
  },

  updatePlan(id: string, data: UpdatePlanRequest): Plan | null {
    if (!data.destination.trim()) {
      throw new Error('目的地不能为空');
    }
    if (!data.startDate || !data.endDate) {
      throw new Error('出发日期和返回日期不能为空');
    }
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new Error('出发日期不能晚于返回日期');
    }
    return PlanModel.update(id, data);
  },

  deletePlan(id: string): boolean {
    return PlanModel.delete(id);
  },
};
