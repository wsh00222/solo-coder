const dayjs = require('dayjs');

const STATUS_MAP = {
  available: 'available',
  borrowed: 'borrowed',
  maintenance: 'maintenance',
  borrowing: 'borrowing',
  returned: 'returned',
  overdue: 'overdue'
};

function getNowDateTime() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

function getToday() {
  return dayjs().format('YYYY-MM-DD');
}

function isValidDate(dateStr) {
  return dayjs(dateStr, 'YYYY-MM-DD', true).isValid();
}

function isDateAfter(date1, date2) {
  return dayjs(date1).isAfter(dayjs(date2), 'day');
}

function isDateBefore(date1, date2) {
  return dayjs(date1).isBefore(dayjs(date2), 'day');
}

function daysBetween(date1, date2) {
  return dayjs(date1).diff(dayjs(date2), 'day');
}

function equipmentWithOverdue(equipment) {
  if (!equipment) return null;
  if (equipment.status !== 'borrowed') return equipment;
  return equipment;
}

function computeRecordStatus(record) {
  if (!record) return record;
  if (record.status === 'returned') return record;
  const today = getToday();
  if (isDateBefore(record.expected_return_date, today)) {
    return { ...record, displayStatus: 'overdue' };
  }
  return { ...record, displayStatus: 'borrowing' };
}

function computeEquipmentOverdue(equipment, activeRecords = []) {
  if (!equipment) return equipment;
  if (equipment.status !== 'borrowed') return { ...equipment, is_overdue: false };
  const today = getToday();
  if (activeRecords.length > 0) {
    const overdue = activeRecords.some(r => isDateBefore(r.expected_return_date, today));
    return { ...equipment, is_overdue: overdue };
  }
  return { ...equipment, is_overdue: false };
}

module.exports = {
  STATUS_MAP,
  getNowDateTime,
  getToday,
  isValidDate,
  isDateAfter,
  isDateBefore,
  daysBetween,
  computeRecordStatus,
  computeEquipmentOverdue
};
