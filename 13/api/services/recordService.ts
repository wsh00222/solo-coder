import { RecordModel, Record, CreateRecordInput, RecordFilters } from '../models/Record';
import { PlanModel } from '../models/Plan';

export interface RecordsGroupedByWeek {
  weekStart: string;
  weekEnd: string;
  records: Record[];
}

export const RecordService = {
  async getByPlanId(planId: number, filters?: RecordFilters): Promise<RecordsGroupedByWeek[]> {
    const records = await RecordModel.getAllByPlanId(planId, filters);
    return this.groupByWeek(records);
  },

  async getAllFlat(planId: number, filters?: RecordFilters): Promise<Record[]> {
    return RecordModel.getAllByPlanId(planId, filters);
  },

  groupByWeek(records: Record[]): RecordsGroupedByWeek[] {
    const map = new Map<string, Record[]>();
    for (const r of records) {
      const ws = this.getWeekStart(r.date);
      if (!map.has(ws)) map.set(ws, []);
      map.get(ws)!.push(r);
    }
    const result: RecordsGroupedByWeek[] = [];
    for (const [ws, recs] of map.entries()) {
      result.push({
        weekStart: ws,
        weekEnd: this.addDays(ws, 6),
        records: recs.sort((a, b) => b.date.localeCompare(a.date)),
      });
    }
    return result.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  },

  getWeekStart(dateStr: string): string {
    const d = this.parseDate(dateStr);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return this.formatDate(d);
  },

  addDays(dateStr: string, days: number): string {
    const d = this.parseDate(dateStr);
    d.setDate(d.getDate() + days);
    return this.formatDate(d);
  },

  parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  },

  formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  async create(input: CreateRecordInput): Promise<{ record: Record; existed: boolean } | { error: string }> {
    const plan = await PlanModel.getById(input.plan_id);
    if (!plan) return { error: '计划不存在' };
    const existing = await RecordModel.getByPlanAndDate(input.plan_id, input.date);
    const record = await RecordModel.upsert(input);
    return { record, existed: !!existing };
  },

  async remove(id: number): Promise<boolean> {
    return RecordModel.remove(id);
  },

  async checkTodayRecord(planId: number, date: string): Promise<Record | undefined> {
    return RecordModel.getByPlanAndDate(planId, date);
  },
};
