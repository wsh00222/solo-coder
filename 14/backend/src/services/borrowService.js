const { db } = require('../models/database');
const {
  getNowDateTime,
  getToday,
  isDateAfter,
  isDateBefore,
  daysBetween,
  computeRecordStatus
} = require('../utils/helpers');

function _getEquipmentRaw(id) {
  return db.prepare('SELECT * FROM equipment WHERE id = ?').get(id);
}

function _updateEquipmentStatus(id, status) {
  const now = getNowDateTime();
  db.prepare('UPDATE equipment SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
}

function getAllRecords({ equipmentId = null } = {}) {
  const conditions = [];
  const params = [];

  if (equipmentId) {
    conditions.push('equipment_id = ?');
    params.push(equipmentId);
  }

  let sql = 'SELECT * FROM borrow_record';
  if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY borrow_date DESC, id DESC';
  const records = db.prepare(sql).all(...params);
  return records.map(r => computeRecordStatus(r));
}

function getRecordsByEquipment(equipmentId) {
  const records = db.prepare(
    'SELECT * FROM borrow_record WHERE equipment_id = ? ORDER BY borrow_date DESC, id DESC'
  ).all(equipmentId);
  return records.map(r => computeRecordStatus(r));
}

function getActiveRecordsByEquipment(equipmentId) {
  return db.prepare(
    'SELECT * FROM borrow_record WHERE equipment_id = ? AND status = ?'
  ).all(equipmentId, 'borrowing');
}

function getActiveRecordByEquipment(equipmentId) {
  return db.prepare(
    'SELECT * FROM borrow_record WHERE equipment_id = ? AND status = ? ORDER BY id DESC LIMIT 1'
  ).get(equipmentId, 'borrowing');
}

function getRecordById(id) {
  const record = db.prepare('SELECT * FROM borrow_record WHERE id = ?').get(id);
  return record ? computeRecordStatus(record) : null;
}

function borrowEquipment(equipmentId, { borrower, reason, expectedReturnDate }) {
  const equipment = _getEquipmentRaw(equipmentId);
  if (!equipment) throw new Error('设备不存在');
  if (equipment.status !== 'available') throw new Error('设备当前不可借用');

  const today = getToday();
  if (!isDateAfter(expectedReturnDate, today)) {
    throw new Error('预计归还日期必须晚于当天');
  }

  const now = getNowDateTime();
  const borrowDate = today;

  const stmt = db.prepare(`
    INSERT INTO borrow_record (equipment_id, borrower, reason, borrow_date, expected_return_date, actual_return_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    equipmentId, borrower, reason, borrowDate, expectedReturnDate, null, 'borrowing', now, now
  );

  _updateEquipmentStatus(equipmentId, 'borrowed');

  return getRecordById(result.lastInsertRowid);
}

function returnEquipment(equipmentId, { actualReturnDate = null, toMaintenance = false } = {}) {
  const equipment = _getEquipmentRaw(equipmentId);
  if (!equipment) throw new Error('设备不存在');
  if (equipment.status !== 'borrowed') throw new Error('设备当前未被借出，无需归还');

  const activeRecord = getActiveRecordByEquipment(equipmentId);
  if (!activeRecord) throw new Error('未找到有效的借用记录');

  const returnDate = actualReturnDate || getToday();
  const now = getNowDateTime();

  db.prepare(`
    UPDATE borrow_record 
    SET actual_return_date = ?, status = ?, updated_at = ?
    WHERE id = ?
  `).run(returnDate, 'returned', now, activeRecord.id);

  const newStatus = toMaintenance ? 'maintenance' : 'available';
  _updateEquipmentStatus(equipmentId, newStatus);

  return getRecordById(activeRecord.id);
}

function getEquipmentBorrowStats(equipmentId) {
  const records = getRecordsByEquipment(equipmentId);
  const returnedRecords = records.filter(r => r.status === 'returned');

  const totalCount = records.length;

  if (returnedRecords.length === 0) {
    return {
      totalCount,
      returnedCount: 0,
      avgDuration: null,
      maxDuration: null
    };
  }

  let totalDays = 0;
  let maxDays = 0;

  for (const r of returnedRecords) {
    const days = daysBetween(r.actual_return_date, r.borrow_date);
    const duration = days > 0 ? days : 1;
    totalDays += duration;
    if (duration > maxDays) maxDays = duration;
  }

  return {
    totalCount,
    returnedCount: returnedRecords.length,
    avgDuration: +(totalDays / returnedRecords.length).toFixed(1),
    maxDuration: maxDays
  };
}

module.exports = {
  getAllRecords,
  getRecordsByEquipment,
  getActiveRecordsByEquipment,
  getActiveRecordByEquipment,
  getRecordById,
  borrowEquipment,
  returnEquipment,
  getEquipmentBorrowStats
};
