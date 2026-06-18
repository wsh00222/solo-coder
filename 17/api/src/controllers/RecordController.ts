import type { Request, Response } from 'express';
import { RecordService } from '../services/RecordService.js';
import type { CreateRecordDto, UpdateRecordDto, ApiResponse } from '../../../shared/types.js';

export const RecordController = {
  async getRecords(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const records = await RecordService.getRecordsByPlanId(planId);
      res.json({ success: true, data: records } as ApiResponse<typeof records>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },

  async addRecord(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const { date, durationMinutes, content } = req.body as CreateRecordDto;

      if (!date || !durationMinutes || !content?.trim()) {
        return res.status(400).json({
          success: false,
          error: '请填写所有必填字段',
        } as ApiResponse<null>);
      }

      const result = await RecordService.upsertRecord(planId, {
        date,
        durationMinutes,
        content: content.trim(),
      });

      res.status(result.isUpdate ? 200 : 201).json({
        success: true,
        data: result.record,
        message: result.isUpdate ? '今日记录已更新' : '记录已添加',
      } as ApiResponse<typeof result.record>);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '添加失败',
      } as ApiResponse<null>);
    }
  },

  async updateRecord(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      const recordId = parseInt(req.params.recordId);

      if (isNaN(planId) || isNaN(recordId)) {
        return res.status(400).json({
          success: false,
          error: '无效的ID',
        } as ApiResponse<null>);
      }

      const data = req.body as UpdateRecordDto;
      const record = await RecordService.updateRecord(planId, recordId, data);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: '记录不存在',
        } as ApiResponse<null>);
      }

      res.json({ success: true, data: record } as ApiResponse<typeof record>);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '更新失败',
      } as ApiResponse<null>);
    }
  },

  async deleteRecord(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      const recordId = parseInt(req.params.recordId);

      if (isNaN(planId) || isNaN(recordId)) {
        return res.status(400).json({
          success: false,
          error: '无效的ID',
        } as ApiResponse<null>);
      }

      const success = await RecordService.deleteRecord(planId, recordId);
      if (!success) {
        return res.status(404).json({
          success: false,
          error: '记录不存在',
        } as ApiResponse<null>);
      }

      res.json({
        success: true,
        message: '记录已删除',
      } as ApiResponse<null>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '删除失败',
      } as ApiResponse<null>);
    }
  },

  async getTrendData(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      const days = parseInt(req.query.days as string) || 30;

      if (isNaN(planId)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const trendData = await RecordService.getTrendData(planId, days);
      res.json({ success: true, data: trendData } as ApiResponse<typeof trendData>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },

  async exportCSV(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const csv = await RecordService.exportToCSV(planId);
      const filename = `学习记录_${Date.now()}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      } as ApiResponse<null>);
    }
  },

  checkTodayRecord(req: Request, res: Response) {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({
          success: false,
          error: '无效的计划ID',
        } as ApiResponse<null>);
      }

      const exists = RecordService.checkTodayRecordExists(planId);
      res.json({ success: true, data: { exists } } as ApiResponse<{ exists: boolean }>);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器错误',
      } as ApiResponse<null>);
    }
  },
};
