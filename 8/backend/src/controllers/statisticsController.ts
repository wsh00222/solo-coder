import { Request, Response } from 'express';
import * as statisticsService from '../services/statisticsService';

export async function getStatistics(req: Request, res: Response) {
  try {
    const stats = await statisticsService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
}
