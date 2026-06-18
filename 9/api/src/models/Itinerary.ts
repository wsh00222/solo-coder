import { db } from '../db';
import type { Itinerary, CreateItineraryRequest, UpdateItineraryRequest, TimeSlot } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export interface ItineraryRow {
  id: string;
  plan_id: string;
  date: string;
  time_slot: TimeSlot;
  activity: string;
  location: string;
  transportation: string | null;
  created_at: string;
}

function rowToItinerary(row: ItineraryRow): Itinerary {
  return {
    id: row.id,
    planId: row.plan_id,
    date: row.date,
    timeSlot: row.time_slot,
    activity: row.activity,
    location: row.location,
    transportation: row.transportation ?? undefined,
    createdAt: row.created_at,
  };
}

const timeSlotOrder: Record<TimeSlot, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
};

export const ItineraryModel = {
  findByPlanId(planId: string): Itinerary[] {
    const rows = db.prepare('SELECT * FROM itineraries WHERE plan_id = ? ORDER BY date ASC, created_at ASC')
      .all(planId) as ItineraryRow[];
    
    return rows.map(rowToItinerary).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return timeSlotOrder[a.timeSlot] - timeSlotOrder[b.timeSlot];
    });
  },

  findById(id: string): Itinerary | null {
    const row = db.prepare('SELECT * FROM itineraries WHERE id = ?').get(id) as ItineraryRow | undefined;
    return row ? rowToItinerary(row) : null;
  },

  create(planId: string, data: CreateItineraryRequest): Itinerary {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO itineraries (id, plan_id, date, time_slot, activity, location, transportation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      planId,
      data.date,
      data.timeSlot,
      data.activity,
      data.location,
      data.transportation ?? null
    );
    const result = ItineraryModel.findById(id);
    if (!result) throw new Error('Failed to create itinerary');
    return result;
  },

  update(id: string, data: UpdateItineraryRequest): Itinerary | null {
    const stmt = db.prepare(`
      UPDATE itineraries
      SET date = ?, time_slot = ?, activity = ?, location = ?, transportation = ?
      WHERE id = ?
    `);
    const result = stmt.run(
      data.date,
      data.timeSlot,
      data.activity,
      data.location,
      data.transportation ?? null,
      id
    );
    if (result.changes === 0) return null;
    return ItineraryModel.findById(id);
  },

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM itineraries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  findConflicts(planId: string, date: string, timeSlot: TimeSlot, excludeId?: string): Itinerary[] {
    let sql = 'SELECT * FROM itineraries WHERE plan_id = ? AND date = ? AND time_slot = ?';
    const params: (string | TimeSlot)[] = [planId, date, timeSlot];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const rows = db.prepare(sql).all(...params) as ItineraryRow[];
    return rows.map(rowToItinerary);
  },

  copy(id: string): Itinerary | null {
    const original = ItineraryModel.findById(id);
    if (!original) return null;

    const newId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO itineraries (id, plan_id, date, time_slot, activity, location, transportation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      newId,
      original.planId,
      original.date,
      original.timeSlot,
      original.activity,
      original.location,
      original.transportation ?? null
    );
    return ItineraryModel.findById(newId);
  },
};
