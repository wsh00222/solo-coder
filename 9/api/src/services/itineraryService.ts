import { ItineraryModel } from '../models/Itinerary';
import { PlanModel } from '../models/Plan';
import type { Itinerary, CreateItineraryRequest, UpdateItineraryRequest } from '@shared/types';

export const itineraryService = {
  getItinerariesByPlanId(planId: string): Itinerary[] {
    return ItineraryModel.findByPlanId(planId);
  },

  createItinerary(planId: string, data: CreateItineraryRequest): Itinerary {
    const plan = PlanModel.findById(planId);
    if (!plan) {
      throw new Error('旅行计划不存在');
    }
    
    if (data.date < plan.startDate || data.date > plan.endDate) {
      throw new Error('行程日期必须在旅行计划的日期区间内');
    }
    
    if (!data.activity.trim()) {
      throw new Error('活动描述不能为空');
    }
    if (!data.location.trim()) {
      throw new Error('地点不能为空');
    }
    
    return ItineraryModel.create(planId, data);
  },

  updateItinerary(planId: string, id: string, data: UpdateItineraryRequest): Itinerary | null {
    const plan = PlanModel.findById(planId);
    if (!plan) {
      throw new Error('旅行计划不存在');
    }
    
    const existing = ItineraryModel.findById(id);
    if (!existing || existing.planId !== planId) {
      return null;
    }
    
    if (data.date < plan.startDate || data.date > plan.endDate) {
      throw new Error('行程日期必须在旅行计划的日期区间内');
    }
    
    if (!data.activity.trim()) {
      throw new Error('活动描述不能为空');
    }
    if (!data.location.trim()) {
      throw new Error('地点不能为空');
    }
    
    return ItineraryModel.update(id, data);
  },

  deleteItinerary(planId: string, id: string): boolean {
    const existing = ItineraryModel.findById(id);
    if (!existing || existing.planId !== planId) {
      return false;
    }
    return ItineraryModel.delete(id);
  },

  checkConflicts(planId: string, date: string, timeSlot: string, excludeId?: string): Itinerary[] {
    return ItineraryModel.findConflicts(planId, date, timeSlot as any, excludeId);
  },

  copyItinerary(planId: string, id: string): Itinerary | null {
    const existing = ItineraryModel.findById(id);
    if (!existing || existing.planId !== planId) {
      return null;
    }
    return ItineraryModel.copy(id);
  },
};
