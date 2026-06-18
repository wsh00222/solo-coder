const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(dataPath)) {
    return { records: [], nextId: 1 };
  }
  try {
    const content = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return { records: [], nextId: 1 };
  }
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

function hasAnyRecords() {
  const data = readData();
  return data.records.length > 0;
}

function generateSampleData() {
  const today = new Date();
  const samples = [
    { amount: 8000, category: '工资', date: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)), note: '6月工资' },
    { amount: -35.5, category: '餐饮', date: formatDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)), note: '午餐' },
    { amount: -128, category: '购物', date: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)), note: '日用品' },
    { amount: -15, category: '交通', date: formatDate(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)), note: '地铁' },
    { amount: -88.88, category: '餐饮', date: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)), note: '朋友聚餐' }
  ];

  const data = readData();
  const now = new Date().toISOString();

  for (const s of samples) {
    data.records.push({
      id: data.nextId++,
      amount: s.amount,
      category: s.category,
      date: s.date,
      note: s.note || null,
      created_at: now,
      updated_at: now
    });
  }

  writeData(data);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getAllRecords(filters = {}) {
  const data = readData();
  let records = [...data.records];

  if (filters.category && filters.category !== '全部') {
    records = records.filter(r => r.category === filters.category);
  }
  if (filters.startDate) {
    records = records.filter(r => r.date >= filters.startDate);
  }
  if (filters.endDate) {
    records = records.filter(r => r.date <= filters.endDate);
  }

  records.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.id - a.id;
  });

  return records;
}

function getRecordById(id) {
  const data = readData();
  return data.records.find(r => r.id === Number(id)) || null;
}

function addRecord(record) {
  const data = readData();
  const now = new Date().toISOString();
  const newRecord = {
    id: data.nextId++,
    amount: record.amount,
    category: record.category || '其他',
    date: record.date || formatDate(new Date()),
    note: record.note || null,
    created_at: now,
    updated_at: now
  };
  data.records.push(newRecord);
  writeData(data);
  return newRecord;
}

function updateRecord(id, record) {
  const data = readData();
  const index = data.records.findIndex(r => r.id === Number(id));
  if (index === -1) return null;

  data.records[index] = {
    ...data.records[index],
    amount: record.amount,
    category: record.category || '其他',
    date: record.date,
    note: record.note || null,
    updated_at: new Date().toISOString()
  };

  writeData(data);
  return data.records[index];
}

function deleteRecord(id) {
  const data = readData();
  const index = data.records.findIndex(r => r.id === Number(id));
  if (index === -1) return false;

  data.records.splice(index, 1);
  writeData(data);
  return true;
}

module.exports = {
  hasAnyRecords,
  generateSampleData,
  getAllRecords,
  getRecordById,
  addRecord,
  updateRecord,
  deleteRecord
};
