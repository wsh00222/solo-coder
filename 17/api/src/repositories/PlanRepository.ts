import { db } from '../database.js';
import type { Plan, CreatePlanDto, UpdatePlanDto } from '../../../shared/types.js';

interface PlanRow {
  id: number;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  daily_goal_minutes: number;
  created_at: string;
  updated_at: string;
}

function mapRowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    goal: row.goal,
    startDate: row.start_date,
    endDate: row.end_date,
    dailyGoalMinutes: row.daily_goal_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const PlanRepository = {
  findAll(options?: {
    status?: 'all' | 'active' | 'completed';
    sortBy?: 'startDate' | 'endDate' | 'name' | 'createdAt';
    search?: string;
  }): Plan[] {
    let sql = `SELECT * FROM plans WHERE 1=1`;
    const params: (string | number)[] = [];
    const today = new Date().toISOString().split('T')[0];

    if (options?.status === 'active') {
      sql += ` AND end_date >= ?`;
      params.push(today);
    } else if (options?.status === 'completed') {
      sql += ` AND end_date < ?`;
      params.push(today);
    }

    if (options?.search) {
      sql += ` AND (name LIKE ? OR goal LIKE ?)`;
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    if (options?.sortBy === 'startDate') {
      sql += ` ORDER BY start_date DESC`;
    } else if (options?.sortBy === 'endDate') {
      sql += ` ORDER BY end_date DESC`;
    } else if (options?.sortBy === 'name') {
      sql += ` ORDER BY name ASC`;
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    const rows = db.prepare(sql).all(...params) as unknown as PlanRow[];
    return rows.map(mapRowToPlan);
  },

  findById(id: number): Plan | null {
    const row = db.prepare(`SELECT * FROM plans WHERE id = ?`).get(id) as unknown as PlanRow | undefined;
    return row ? mapRowToPlan(row) : null;
  },

  create(data: CreatePlanDto): Plan {
    const result = db
      .prepare(
        `INSERT INTO plans (name, goal, start_date, end_date, daily_goal_minutes)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(data.name, data.goal, data.startDate, data.endDate, data.dailyGoalMinutes);

    const plan = this.findById(result.lastInsertRowid as number);
    if (!plan) throw new Error('Failed to create plan');
    return plan;
  },

  update(id: number, data: UpdatePlanDto): Plan | null {
    const fields: string[] = [];
    const params: (string | number)[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.goal !== undefined) {
      fields.push('goal = ?');
      params.push(data.goal);
    }
    if (data.endDate !== undefined) {
      fields.push('end_date = ?');
      params.push(data.endDate);
    }
    if (data.dailyGoalMinutes !== undefined) {
      fields.push('daily_goal_minutes = ?');
      params.push(data.dailyGoalMinutes);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`).run(...params);

    return this.findById(id);
  },

  delete(id: number): boolean {
    const result = db.prepare(`DELETE FROM plans WHERE id = ?`).run(id);
    return result.changes > 0;
  },

  countAll(): number {
    const row = db.prepare(`SELECT COUNT(*) as count FROM plans`).get() as unknown as { count: number };
    return row.count;
  },

  countActive(): number {
    const today = new Date().toISOString().split('T')[0];
    const row = db
      .prepare(`SELECT COUNT(*) as count FROM plans WHERE end_date >= ?`)
      .get(today) as unknown as { count: number };
    return row.count;
  },
};
