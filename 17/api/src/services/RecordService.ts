import { RecordRepository } from '../repositories/RecordRepository.js';
import { PlanRepository } from '../repositories/PlanRepository.js';
import type {
  Record,
  CreateRecordDto,
  UpdateRecordDto,
  TrendDataPoint,
} from '../../../shared/types.js';

export const RecordService = {
  async getRecordsByPlanId(planId: number): Promise<Record[]> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');
    return RecordRepository.findByPlanId(planId);
  },

  async addRecord(planId: number, data: CreateRecordDto): Promise<Record> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');

    if (data.durationMinutes <= 0) {
      throw new Error('学习时长必须大于0');
    }
    if (!data.content.trim()) {
      throw new Error('学习内容不能为空');
    }

    return RecordRepository.create(planId, data);
  },

  async upsertRecord(planId: number, data: CreateRecordDto): Promise<{ record: Record; isUpdate: boolean }> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');

    if (data.durationMinutes <= 0) {
      throw new Error('学习时长必须大于0');
    }
    if (!data.content.trim()) {
      throw new Error('学习内容不能为空');
    }

    const existing = RecordRepository.findByPlanIdAndDate(planId, data.date);
    const record = RecordRepository.upsert(planId, data);
    return { record, isUpdate: !!existing };
  },

  async updateRecord(planId: number, recordId: number, data: UpdateRecordDto): Promise<Record | null> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');

    const record = RecordRepository.findById(recordId);
    if (!record || record.planId !== planId) return null;

    if (data.durationMinutes !== undefined && data.durationMinutes <= 0) {
      throw new Error('学习时长必须大于0');
    }

    return RecordRepository.update(recordId, data);
  },

  async deleteRecord(planId: number, recordId: number): Promise<boolean> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');

    const record = RecordRepository.findById(recordId);
    if (!record || record.planId !== planId) return false;

    return RecordRepository.delete(recordId);
  },

  async getTrendData(planId: number, days: number = 30): Promise<TrendDataPoint[]> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');
    return RecordRepository.getTrendData(planId, days);
  },

  async exportToCSV(planId: number): Promise<string> {
    const plan = PlanRepository.findById(planId);
    if (!plan) throw new Error('计划不存在');

    const records = RecordRepository.findByPlanId(planId);

    const header = '日期,学习时长(分钟),学习内容\n';
    const rows = records
      .map((r) => `${r.date},${r.durationMinutes},"${r.content.replace(/"/g, '""')}"`)
      .join('\n');

    return '\uFEFF' + header + rows;
  },

  checkTodayRecordExists(planId: number): boolean {
    const today = new Date().toISOString().split('T')[0];
    return !!RecordRepository.findByPlanIdAndDate(planId, today);
  },
};
