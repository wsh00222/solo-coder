import { db } from '../db';
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

export const PlanModel = {
  getAll(): Plan[] {
    return db.prepare('SELECT * FROM plans ORDER BY created_at DESC').all() as Plan[];
  },

  getById(id: number): Plan | undefined {
    return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
  },

  create(input: CreatePlanInput): Plan {
    const now = getServerDateTime();
    const result = db.prepare(`
      INSERT INTO plans (name, goal, weekly_frequency, start_date, end_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(input.name, input.goal, input.weekly_frequency, input.start_date, input.end_date ?? null, now, now);
    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, input: UpdatePlanInput): Plan | undefined {
    const plan = this.getById(id);
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
    db.prepare(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getById(id);
  },

  remove(id: number): boolean {
    const result = db.prepare('DELETE FROM plans WHERE id = ?').run(id);
    return result.changes > 0;
  },

  count(): number {
    return (db.prepare('SELECT COUNT(*) as cnt FROM plans').get() as { cnt: number }).cnt;
  }
};
