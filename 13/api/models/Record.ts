import { getDb, scheduleSave } from '../db';
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

function toRecord(row: any): Record {
  return {
    id: row.id,
    plan_id: row.plan_id,
    date: row.date,
    duration: row.duration,
    content: row.content,
    feeling: row.feeling ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

async function run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  const info = db.exec('SELECT last_insert_rowid() AS lid, changes() AS ch');
  scheduleSave();
  const row = info[0]?.values[0] as any;
  return { lastInsertRowid: row?.[0] ?? 0, changes: row?.[1] ?? 0 };
}

export const RecordModel = {
  async getAllByPlanId(planId: number, filters?: RecordFilters): Promise<Record[]> {
    let sql = 'SELECT * FROM records WHERE plan_id = ?';
    const params: any[] = [planId];
    if (filters?.startDate) { sql += ' AND date >= ?'; params.push(filters.startDate); }
    if (filters?.endDate) { sql += ' AND date <= ?'; params.push(filters.endDate); }
    if (filters?.minFeeling) { sql += ' AND feeling >= ?'; params.push(filters.minFeeling); }
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query<any>(sql, params);
    return rows.map(toRecord);
  },

  async getById(id: number): Promise<Record | undefined> {
    const rows = await query<any>('SELECT * FROM records WHERE id = ?', [id]);
    return rows.length ? toRecord(rows[0]) : undefined;
  },

  async getByPlanAndDate(planId: number, date: string): Promise<Record | undefined> {
    const rows = await query<any>('SELECT * FROM records WHERE plan_id = ? AND date = ?', [planId, date]);
    return rows.length ? toRecord(rows[0]) : undefined;
  },

  async create(input: CreateRecordInput): Promise<Record> {
    const now = getServerDateTime();
    const result = await run(
      `INSERT INTO records (plan_id, date, duration, content, feeling, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [input.plan_id, input.date, input.duration, input.content, input.feeling ?? null, now, now]
    );
    return (await this.getById(result.lastInsertRowid))!;
  },

  async update(id: number, input: UpdateRecordInput): Promise<Record | undefined> {
    const record = await this.getById(id);
    if (!record) return undefined;
    const now = getServerDateTime();
    const fields: string[] = [];
    const values: any[] = [];
    if (input.duration !== undefined) { fields.push('duration = ?'); values.push(input.duration); }
    if (input.content !== undefined) { fields.push('content = ?'); values.push(input.content); }
    if (input.feeling !== undefined) { fields.push('feeling = ?'); values.push(input.feeling ?? null); }
    fields.push('updated_at = ?'); values.push(now);
    values.push(id);
    await run(`UPDATE records SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  },

  async upsert(input: CreateRecordInput): Promise<Record> {
    const existing = await this.getByPlanAndDate(input.plan_id, input.date);
    if (existing) {
      return (await this.update(existing.id, { duration: input.duration, content: input.content, feeling: input.feeling }))!;
    }
    return this.create(input);
  },

  async remove(id: number): Promise<boolean> {
    const result = await run('DELETE FROM records WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async getAllDates(): Promise<string[]> {
    const rows = await query<any>('SELECT DISTINCT date FROM records ORDER BY date DESC');
    return rows.map(r => r.date);
  },

  async getAll(filters?: RecordFilters & { planId?: number }): Promise<Record[]> {
    let sql = 'SELECT * FROM records WHERE 1=1';
    const params: any[] = [];
    if (filters?.planId) { sql += ' AND plan_id = ?'; params.push(filters.planId); }
    if (filters?.startDate) { sql += ' AND date >= ?'; params.push(filters.startDate); }
    if (filters?.endDate) { sql += ' AND date <= ?'; params.push(filters.endDate); }
    if (filters?.minFeeling) { sql += ' AND feeling >= ?'; params.push(filters.minFeeling); }
    sql += ' ORDER BY date DESC, created_at DESC';
    const rows = await query<any>(sql, params);
    return rows.map(toRecord);
  }
};
