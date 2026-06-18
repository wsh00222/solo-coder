const { db } = require('../models/database');
const { getNowDateTime, getToday, isDateBefore, computeEquipmentOverdue } = require('../utils/helpers');
const borrowService = require('./borrowService');

function getAllEquipment({ status = null, keyword = '', refreshOverdue = true } = {}) {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (keyword && keyword.trim()) {
    conditions.push('(name LIKE ? OR code LIKE ?)');
    const like = `%${keyword.trim()}%`;
    params.push(like, like);
  }

  let sql = 'SELECT * FROM equipment';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY id DESC';
  const equipments = db.prepare(sql).all(...params);

  if (refreshOverdue) {
    return equipments.map(eq => {
      const activeRecords = eq.status === 'borrowed'
        ? borrowService.getActiveRecordsByEquipment(eq.id)
        : [];
      return computeEquipmentOverdue(eq, activeRecords);
    });
  }

  return equipments;
}

function getEquipmentById(id) {
  const equipment = db.prepare('SELECT * FROM equipment WHERE id = ?').get(id);
  if (!equipment) return null;
  const activeRecords = equipment.status === 'borrowed'
    ? borrowService.getActiveRecordsByEquipment(equipment.id)
    : [];
  return computeEquipmentOverdue(equipment, activeRecords);
}

function getEquipmentByCode(code) {
  return db.prepare('SELECT * FROM equipment WHERE code = ?').get(code);
}

function createEquipment({ name, code, model, location, status = 'available' }) {
  const now = getNowDateTime();
  const stmt = db.prepare(`
    INSERT INTO equipment (name, code, model, location, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, code, model, location, status, now, now);
  return getEquipmentById(result.lastInsertRowid);
}

function updateEquipment(id, { name, model, location, status }) {
  const existing = getEquipmentById(id);
  if (!existing) return null;

  const now = getNowDateTime();
  const stmt = db.prepare(`
    UPDATE equipment 
    SET name = ?, model = ?, location = ?, status = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(
    name ?? existing.name,
    model ?? existing.model,
    location ?? existing.location,
    status ?? existing.status,
    now,
    id
  );
  return getEquipmentById(id);
}

function deleteEquipment(id) {
  db.prepare('DELETE FROM borrow_record WHERE equipment_id = ?').run(id);
  const result = db.prepare('DELETE FROM equipment WHERE id = ?').run(id);
  return result.changes > 0;
}

function getStatistics() {
  const all = db.prepare('SELECT * FROM equipment').all();
  const today = getToday();

  let available = 0;
  let borrowed = 0;
  let maintenance = 0;
  let overdue = 0;

  for (const eq of all) {
    if (eq.status === 'available') available++;
    else if (eq.status === 'maintenance') maintenance++;
    else if (eq.status === 'borrowed') {
      borrowed++;
      const activeRecords = borrowService.getActiveRecordsByEquipment(eq.id);
      const isOverdue = activeRecords.some(r => isDateBefore(r.expected_return_date, today));
      if (isOverdue) overdue++;
    }
  }

  return {
    total: all.length,
    available,
    borrowed,
    maintenance,
    overdue
  };
}

function getLocations() {
  const rows = db.prepare('SELECT DISTINCT location FROM equipment WHERE location IS NOT NULL AND location != ""').all();
  return rows.map(r => r.location).filter(Boolean);
}

module.exports = {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByCode,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getStatistics,
  getLocations
};
