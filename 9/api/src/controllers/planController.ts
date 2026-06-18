import { Request, Response } from 'express';
import { planService } from '../services/planService';
import type { CreatePlanRequest, UpdatePlanRequest, ApiResponse } from '@shared/types';

export const planController = {
  async getAllPlans(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const plans = planService.getAllPlans();
      res.json({ success: true, data: plans });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '获取计划列表失败' 
      });
    }
  },

  async getPlanById(req: Request<{ id: string }>, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const plan = planService.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ success: false, error: '计划不存在' });
      }
      res.json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '获取计划详情失败' 
      });
    }
  },

  async createPlan(req: Request<{}, {}, CreatePlanRequest>, res: Response<ApiResponse<any>>) {
    try {
      const plan = planService.createPlan(req.body);
      res.status(201).json({ success: true, data: plan, message: '计划创建成功' });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '创建计划失败' 
      });
    }
  },

  async updatePlan(req: Request<{ id: string }, {}, UpdatePlanRequest>, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const plan = planService.updatePlan(id, req.body);
      if (!plan) {
        return res.status(404).json({ success: false, error: '计划不存在' });
      }
      res.json({ success: true, data: plan, message: '计划更新成功' });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '更新计划失败' 
      });
    }
  },

  async deletePlan(req: Request<{ id: string }>, res: Response<ApiResponse<any>>) {
    try {
      const { id } = req.params;
      const deleted = planService.deletePlan(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: '计划不存在' });
      }
      res.json({ success: true, message: '计划删除成功' });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : '删除计划失败' 
      });
    }
  },
};
