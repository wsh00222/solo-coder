import { db } from '../db';
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export interface PlanRow {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  companions: string | null;
  budget: number | null;
  notes: string | null;
  created_at: string;
}

function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    companions: row.companions ?? undefined,
    budget: row.budget ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export const PlanModel = {
  findAll(): Plan[] {
    const rows = db.prepare('SELECT * FROM plans ORDER BY start_date ASC').all() as PlanRow[];
    return rows.map(rowToPlan);
  },

  findById(id: string): Plan | null {
    const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as PlanRow | undefined;
    return row ? rowToPlan(row) : null;
  },

  create(data: CreatePlanRequest): Plan {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO plans (id, destination, start_date, end_date, companions, budget, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.destination,
      data.startDate,
      data.endDate,
      data.companions ?? null,
      data.budget ?? null,
      data.notes ?? null
    );
    const result = PlanModel.findById(id);
    if (!result) throw new Error('Failed to create plan');
    return result;
  },

  update(id: string, data: UpdatePlanRequest): Plan | null {
    const stmt = db.prepare(`
      UPDATE plans
      SET destination = ?, start_date = ?, end_date = ?, companions = ?, budget = ?, notes = ?
      WHERE id = ?
    `);
    const result = stmt.run(
      data.destination,
      data.startDate,
      data.endDate,
      data.companions ?? null,
      data.budget ?? null,
      data.notes ?? null,
      id
    );
    if (result.changes === 0) return null;
    return PlanModel.findById(id);
  },

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM plans WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  count(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM plans').get() as { count: number };
    return row.count;
  },
};
