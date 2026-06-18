import { Request, Response } from 'express';
import { StatsService } from '../services/statsService';

export const StatsController = {
  async getGlobal(req: Request, res: Response) {
    const { startDate, endDate, minFeeling, planId } = req.query;
    const filters: any = {};
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);
    if (minFeeling) filters.minFeeling = Number(minFeeling);
    if (planId) filters.planId = Number(planId);
    const stats = await StatsService.getGlobal(filters);
    res.json({ success: true, data: stats });
  },

  async getReminder(req: Request, res: Response) {
    const reminder = await StatsService.getReminder();
    res.json({ success: true, data: reminder });
  },

  async getLast7DaysChart(req: Request, res: Response) {
    const planId = req.query.planId ? Number(req.query.planId) : undefined;
    const chart = await StatsService.getLast7DaysChart(planId);
    res.json({ success: true, data: chart });
  },
};
