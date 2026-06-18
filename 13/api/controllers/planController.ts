import { Request, Response } from 'express';
import { PlanService } from '../services/planService';

export const PlanController = {
  async getAll(req: Request, res: Response) {
    const goal = req.query.goal as string | undefined;
    const plans = await PlanService.getAll(goal);
    res.json({ success: true, data: plans });
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const plan = await PlanService.getById(id);
    if (!plan) {
      res.status(404).json({ success: false, error: '计划不存在' });
      return;
    }
    res.json({ success: true, data: plan });
  },

  async create(req: Request, res: Response) {
    try {
      const { name, goal, weekly_frequency, start_date, end_date } = req.body;
      if (!name || !goal || !weekly_frequency || !start_date) {
        res.status(400).json({ success: false, error: '缺少必填字段' });
        return;
      }
      const plan = await PlanService.create({ name, goal, weekly_frequency: Number(weekly_frequency), start_date, end_date });
      res.json({ success: true, data: plan });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, goal, weekly_frequency, end_date } = req.body;
    const plan = await PlanService.update(id, { name, goal, weekly_frequency: weekly_frequency !== undefined ? Number(weekly_frequency) : undefined, end_date });
    if (!plan) {
      res.status(404).json({ success: false, error: '计划不存在' });
      return;
    }
    res.json({ success: true, data: plan });
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const ok = await PlanService.remove(id);
    if (!ok) {
      res.status(404).json({ success: false, error: '计划不存在' });
      return;
    }
    res.json({ success: true });
  },

  async duplicate(req: Request, res: Response) {
    const id = Number(req.params.id);
    const plan = await PlanService.duplicate(id);
    if (!plan) {
      res.status(404).json({ success: false, error: '计划不存在' });
      return;
    }
    res.json({ success: true, data: plan });
  },
};
