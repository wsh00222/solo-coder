import { db } from '../db';
import { getServerDateTime } from '../utils/date';

export interface Record {
  id: number;
  plan_id: number;
  date: string;
  duration: number;
  content: string;
  feeling: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecordInput {
  plan_id: number;
  date: string;
  duration: number;
  content: string;
  feeling?: number | null;
}

export interface UpdateRecordInput {
  duration?: number;
  content?: string;
  feeling?: number | null;
}

export interface RecordFilters {
  startDate?: string;
  endDate?: string;
  minFeeling?: number;
}

export const RecordModel = {
  getAllByPlanId(planId: number, filters?: RecordFilters): Record[] {
    let sql = 'SELECT * FROM records WHERE plan_id = ?';
    const params: any[] = [planId];
    if (filters?.startDate) { sql += ' AND date >= ?'; params.push(filters.startDate); }
    if (filters?.endDate) { sql += ' AND date <= ?'; params.push(filters.endDate); }
    if (filters?.minFeeling) { sql += ' AND feeling >= ?'; params.push(filters.minFeeling); }
    sql += ' ORDER BY date DESC, created_at DESC';
    return db.prepare(sql).all(...params) as Record[];
  },

  getById(id: number): Record | undefined {
    return db.prepare('SELECT * FROM records WHERE id = ?').get(id) as Record | undefined;
  },

  getByPlanAndDate(planId: number, date: string): Record | undefined {
    return db.prepare('SELECT * FROM records WHERE plan_id = ? AND date = ?').get(planId, date) as Record | undefined;
  },

  create(input: CreateRecordInput): Record {
    const now = getServerDateTime();
    const result = db.prepare(`
      INSERT INTO records (plan_id, date, duration, content, feeling, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(input.plan_id, input.date, input.duration, input.content, input.feeling ?? null, now, now);
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, input: UpdateRecordInput): Record | undefined {
    const record = this.getById(id);
    if (!record) return undefined;
    const now = getServerDateTime();
    const fields: string[] = [];
    const values: any[] = [];
    if (input.duration !== undefined) { fields.push('duration = ?'); values.push(input.duration); }
    if (input.content !== undefined) { fields.push('content = ?'); values.push(input.content); }
    if (input.feeling !== undefined) { fields.push('feeling = ?'); values.push(input.feeling ?? null); }
    fields.push('updated_at = ?'); values.push(now);
    values.push(id);
    db.prepare(`UPDATE records SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  upsert(input: CreateRecordInput): Record {
    const existing = this.getByPlanAndDate(input.plan_id, input.date);
    if (existing) {
      return this.update(existing.id, { duration: input.duration, content: input.content, feeling: input.feeling })!;
    }
    return this.create(input);
  },

  remove(id: number): boolean {
    const result = db.prepare('DELETE FROM records WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getAllDates(): string[] {
    const rows = db.prepare('SELECT DISTINCT date FROM records ORDER BY date DESC').all() as { date: string }[];
    return rows.map(r => r.date);
  },

  getAll(filters?: RecordFilters & { planId?: number }): Record[] {
    let sql = 'SELECT * FROM records WHERE 1=1';
    const params: any[] = [];
    if (filters?.planId) { sql += ' AND plan_id = ?'; params.push(filters.planId); }
    if (filters?.startDate) { sql += ' AND date >= ?'; params.push(filters.startDate); }
    if (filters?.endDate) { sql += ' AND date <= ?'; params.push(filters.endDate); }
    if (filters?.minFeeling) { sql += ' AND feeling >= ?'; params.push(filters.minFeeling); }
    sql += ' ORDER BY date DESC, created_at DESC';
    return db.prepare(sql).all(...params) as Record[];
  }
};
