import { Request, Response } from 'express';
import { itineraryService } from '../services/itineraryService';
import type { CreateItineraryRequest, UpdateItineraryRequest, ApiResponse } from '@shared/types';

export const itineraryController = {
  async getItineraries(req: Request<{ planId: string }>, res: Response<ApiResponse<any>>) {
    try {
      const { planId } = req.params;
      const itineraries = itineraryService.getItinerariesByPlanId(planId);
      res.json({ success: true, data: itineraries });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '获取行程列表失败' 
      });
    }
  },

  async createItinerary(
    req: Request<{ planId: string }, {}, CreateItineraryRequest>, 
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { planId } = req.params;
      const itinerary = itineraryService.createItinerary(planId, req.body);
      res.status(201).json({ success: true, data: itinerary, message: '行程创建成功' });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '创建行程失败' 
      });
    }
  },

  async updateItinerary(
    req: Request<{ planId: string; id: string }, {}, UpdateItineraryRequest>, 
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { planId, id } = req.params;
      const itinerary = itineraryService.updateItinerary(planId, id, req.body);
      if (!itinerary) {
        return res.status(404).json({ success: false, error: '行程不存在' });
      }
      res.json({ success: true, data: itinerary, message: '行程更新成功' });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '更新行程失败' 
      });
    }
  },

  async deleteItinerary(
    req: Request<{ planId: string; id: string }>, 
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { planId, id } = req.params;
      const deleted = itineraryService.deleteItinerary(planId, id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: '行程不存在' });
      }
      res.json({ success: true, message: '行程删除成功' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '删除行程失败' 
      });
    }
  },

  async checkConflicts(
    req: Request<{ planId: string }, {}, {}, { date: string; timeSlot: string; excludeId?: string }>, 
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { planId } = req.params;
      const { date, timeSlot, excludeId } = req.query;
      const conflicts = itineraryService.checkConflicts(planId, date, timeSlot, excludeId);
      res.json({ success: true, data: { hasConflict: conflicts.length > 0, conflicts } });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '检查冲突失败' 
      });
    }
  },

  async copyItinerary(
    req: Request<{ planId: string; id: string }>, 
    res: Response<ApiResponse<any>>
  ) {
    try {
      const { planId, id } = req.params;
      const itinerary = itineraryService.copyItinerary(planId, id);
      if (!itinerary) {
        return res.status(404).json({ success: false, error: '行程不存在' });
      }
      res.json({ success: true, data: itinerary, message: '行程已复制' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '复制行程失败' 
      });
    }
  },
};
