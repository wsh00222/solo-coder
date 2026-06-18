import type { Request, Response } from 'express';
import { PlanService } from '../services/PlanService.js';
import type { CreatePlanDto, UpdatePlanDto, ApiResponse } from '../../../shared/types.js';

export const PlanController = {
  async getAllPlans(req: Request, res: Response) {
    try {
      const { status, sortBy, search } = req.query;

      const options = {
        status: (status as 'all' | 'active' | 'completed') || 'all',
        sortBy: (sortBy as 'startDate' | 'endDate' | 'name') || undefined,
        search: (search as string) || undefined,
      };

      const plans = await PlanService.getAllPlans(options);
      res.json({ success: true, data: plans } as ApiResponse<typeof plans>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },

  async getPlanById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const plan = await PlanService.getPlanById(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: '计划不存在',
        } as ApiResponse<null>);
      }

      res.json({ success: true, data: plan } as ApiResponse<typeof plan>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },

  async createPlan(req: Request, res: Response) {
    try {
      const { name, goal, startDate, endDate, dailyGoalMinutes } = req.body as CreatePlanDto;

      if (!name?.trim() || !goal?.trim() || !startDate || !endDate || !dailyGoalMinutes) {
        return res.status(400).json({
          success: false,
          error: '请填写所有必填字段',
        } as ApiResponse<null>);
      }

      const plan = await PlanService.createPlan({
        name: name.trim(),
        goal: goal.trim(),
        startDate,
        endDate,
        dailyGoalMinutes,
      });

      res.status(201).json({ success: true, data: plan } as ApiResponse<typeof plan>);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '创建失败',
      } as ApiResponse<null>);
    }
  },

  async updatePlan(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const data = req.body as UpdatePlanDto;
      const plan = await PlanService.updatePlan(id, data);

      if (!plan) {
        return res.status(404).json({
          success: false,
          error: '计划不存在',
        } as ApiResponse<null>);
      }

      res.json({ success: true, data: plan } as ApiResponse<typeof plan>);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '更新失败',
      } as ApiResponse<null>);
    }
  },

  async deletePlan(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const success = await PlanService.deletePlan(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          error: '计划不存在',
        } as ApiResponse<null>);
      }

      res.json({
        success: true,
        message: '计划已删除',
      } as ApiResponse<null>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '删除失败',
      } as ApiResponse<null>);
    }
  },
};
