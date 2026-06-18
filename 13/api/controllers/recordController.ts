import { Request, Response } from 'express';
import { RecordService } from '../services/recordService';
import { RecordModel } from '../models/Record';

export const RecordController = {
  async getByPlanId(req: Request, res: Response) {
    const planId = Number(req.params.planId);
    const { startDate, endDate, minFeeling } = req.query;
    const filters: any = {};
    if (startDate) filters.startDate = String(startDate);
    if (endDate) filters.endDate = String(endDate);
    if (minFeeling) filters.minFeeling = Number(minFeeling);
    const grouped = await RecordService.getByPlanId(planId, filters);
    const flat = await RecordService.getAllFlat(planId, filters);
    res.json({ success: true, data: { grouped, flat } });
  },

  async create(req: Request, res: Response) {
    try {
      const { plan_id, date, duration, content, feeling } = req.body;
      if (!plan_id || !date || !duration || !content) {
        res.status(400).json({ success: false, error: '缺少必填字段' });
        return;
      }
      const result = await RecordService.create({
        plan_id: Number(plan_id),
        date,
        duration: Number(duration),
        content,
        feeling: feeling !== undefined && feeling !== null ? Number(feeling) : null,
      });
      if ('error' in result) {
        res.status(400).json({ success: false, error: result.error });
        return;
      }
      res.json({ success: true, data: result.record, existed: result.existed });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  },

  async checkToday(req: Request, res: Response) {
    const planId = Number(req.params.planId);
    const date = req.query.date as string;
    const record = await RecordService.checkTodayRecord(planId, date);
    res.json({ success: true, data: record || null });
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    const ok = await RecordModel.remove(id);
    if (!ok) {
      res.status(404).json({ success: false, error: '记录不存在' });
      return;
    }
    res.json({ success: true });
  },
};
