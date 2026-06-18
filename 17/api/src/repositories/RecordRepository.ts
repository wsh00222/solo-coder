import { db } from '../database.js';
import type { Record, CreateRecordDto, UpdateRecordDto } from '../../../shared/types.js';

interface RecordRow {
  id: number;
  plan_id: number;
  date: string;
  duration_minutes: number;
  content: string;
  created_at: string;
  updated_at: string;
}

function mapRowToRecord(row: RecordRow): Record {
  return {
    id: row.id,
    planId: row.plan_id,
    date: row.date,
    durationMinutes: row.duration_minutes,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const RecordRepository = {
  findByPlanId(planId: number): Record[] {
    const rows = db
      .prepare(`SELECT * FROM records WHERE plan_id = ? ORDER BY date DESC`)
      .all(planId) as unknown as RecordRow[];
    return rows.map(mapRowToRecord);
  },

  findById(id: number): Record | null {
    const row = db.prepare(`SELECT * FROM records WHERE id = ?`).get(id) as unknown as RecordRow | undefined;
    return row ? mapRowToRecord(row) : null;
  },

  findByPlanIdAndDate(planId: number, date: string): Record | null {
    const row = db
      .prepare(`SELECT * FROM records WHERE plan_id = ? AND date = ?`)
      .get(planId, date) as unknown as RecordRow | undefined;
    return row ? mapRowToRecord(row) : null;
  },

  create(planId: number, data: CreateRecordDto): Record {
    const result = db
      .prepare(
        `INSERT INTO records (plan_id, date, duration_minutes, content)
         VALUES (?, ?, ?, ?)`
      )
      .run(planId, data.date, data.durationMinutes, data.content);

    const record = this.findById(result.lastInsertRowid as number);
    if (!record) throw new Error('Failed to create record');
    return record;
  },

  update(id: number, data: UpdateRecordDto): Record | null {
    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (data.durationMinutes !== undefined) {
      fields.push('duration_minutes = ?');
      params.push(data.durationMinutes);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      params.push(data.content);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE records SET ${fields.join(', ')} WHERE id = ?`).run(...params);

    return this.findById(id);
  },

  upsert(planId: number, data: CreateRecordDto): Record {
    const existing = this.findByPlanIdAndDate(planId, data.date);
    if (existing) {
      const updated = this.update(existing.id, {
        durationMinutes: data.durationMinutes,
        content: data.content,
      });
      if (!updated) throw new Error('Failed to update record');
      return updated;
    }
    return this.create(planId, data);
  },

  delete(id: number): boolean {
    const result = db.prepare(`DELETE FROM records WHERE id = ?`).run(id);
    return result.changes > 0;
  },

  getTodayTotalMinutes(): number {
    const today = new Date().toISOString().split('T')[0];
    const row = db
      .prepare(
        `SELECT COALESCE(SUM(duration_minutes), 0) as total
         FROM records WHERE date = ?`
      )
      .get(today) as unknown as { total: number };
    return row.total;
  },

  getMonthStudyDays(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}`;

    const row = db
      .prepare(
        `SELECT COUNT(DISTINCT date) as count
         FROM records WHERE date LIKE ?`
      )
      .get(`${prefix}%`) as unknown as { count: number };
    return row.count;
  },

  getAllDatesByPlanId(planId: number): string[] {
    const rows = db
      .prepare(
        `SELECT DISTINCT date FROM records
         WHERE plan_id = ? ORDER BY date DESC`
      )
      .all(planId) as unknown as { date: string }[];
    return rows.map((r) => r.date);
  },

  getTrendData(planId: number, days: number = 30): { date: string; minutes: number }[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);

    const rows = db
      .prepare(
        `SELECT date, duration_minutes
         FROM records
         WHERE plan_id = ? AND date >= ? AND date <= ?
         ORDER BY date ASC`
      )
      .all(
        planId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ) as unknown as { date: string; duration_minutes: number }[];

    const result: { date: string; minutes: number }[] = [];
    const recordMap = new Map<string, number>();

    for (const row of rows) {
      recordMap.set(row.date, (recordMap.get(row.date) || 0) + row.duration_minutes);
    }

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        minutes: recordMap.get(dateStr) || 0,
      });
    }

    return result;
  },

  getDistinctDatesByPlanId(planId: number): string[] {
    const rows = db
      .prepare(
        `SELECT DISTINCT date FROM records
         WHERE plan_id = ? ORDER BY date ASC`
      )
      .all(planId) as unknown as { date: string }[];
    return rows.map((r) => r.date);
  },
};
