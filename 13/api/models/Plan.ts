import { getDb, scheduleSave } from '../db';
import { getServerDateTime } from '../utils/date';

export interface Plan {
  id: number;
  name: string;
  goal: '增肌' | '减脂' | '保持';
  weekly_frequency: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanInput {
  name: string;
  goal: '增肌' | '减脂' | '保持';
  weekly_frequency: number;
  start_date: string;
  end_date?: string | null;
}

export interface UpdatePlanInput {
  name?: string;
  goal?: '增肌' | '减脂' | '保持';
  weekly_frequency?: number;
  end_date?: string | null;
}

function toPlan(row: any): Plan {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    weekly_frequency: row.weekly_frequency,
    start_date: row.start_date,
    end_date: row.end_date ?? null,
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

export const PlanModel = {
  async getAll(): Promise<Plan[]> {
    const rows = await query<any>('SELECT * FROM plans ORDER BY created_at DESC');
    return rows.map(toPlan);
  },

  async getById(id: number): Promise<Plan | undefined> {
    const rows = await query<any>('SELECT * FROM plans WHERE id = ?', [id]);
    return rows.length ? toPlan(rows[0]) : undefined;
  },

  async create(input: CreatePlanInput): Promise<Plan> {
    const now = getServerDateTime();
    const result = await run(
      `INSERT INTO plans (name, goal, weekly_frequency, start_date, end_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [input.name, input.goal, input.weekly_frequency, input.start_date, input.end_date ?? null, now, now]
    );
    return (await this.getById(result.lastInsertRowid))!;
  },

  async update(id: number, input: UpdatePlanInput): Promise<Plan | undefined> {
    const plan = await this.getById(id);
    if (!plan) return undefined;
    const now = getServerDateTime();
    const fields: string[] = [];
    const values: any[] = [];
    if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
    if (input.goal !== undefined) { fields.push('goal = ?'); values.push(input.goal); }
    if (input.weekly_frequency !== undefined) { fields.push('weekly_frequency = ?'); values.push(input.weekly_frequency); }
    if (input.end_date !== undefined) { fields.push('end_date = ?'); values.push(input.end_date ?? null); }
    fields.push('updated_at = ?'); values.push(now);
    values.push(id);
    await run(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  },

  async remove(id: number): Promise<boolean> {
    const result = await run('DELETE FROM plans WHERE id = ?', [id]);
    return result.changes > 0;
  },

  async count(): Promise<number> {
    const rows = await query<any>('SELECT COUNT(*) as cnt FROM plans');
    return rows[0]?.cnt ?? 0;
  }
};
