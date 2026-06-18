import type { Request, Response } from 'express';
import { StatsService } from '../services/StatsService.js';
import type { ApiResponse } from '../../../shared/types.js';

export const StatsController = {
  async getOverview(req: Request, res: Response) {
    try {
      const stats = await StatsService.getOverview();
      res.json({ success: true, data: stats } as ApiResponse<typeof stats>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },

  async getAlerts(req: Request, res: Response) {
    try {
      const alerts = await StatsService.getAlerts();
      res.json({ success: true, data: alerts } as ApiResponse<typeof alerts>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },
};
