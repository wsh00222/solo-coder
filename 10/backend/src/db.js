const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = {
  books: [],
  readingHistory: [],
  _meta: { bookIdSeq: 0, historyIdSeq: 0 },
};

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(defaultData));
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.books) data.books = [];
    if (!data.readingHistory) data.readingHistory = [];
    if (!data._meta) data._meta = { bookIdSeq: 0, historyIdSeq: 0 };
    return data;
  } catch (e) {
    console.error('数据库文件损坏，重新初始化');
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function localNowISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

let db = null;

function initDB() {
  db = loadDB();
  return db;
}

function getDB() {
  if (!db) initDB();
  return db;
}

function persist() {
  saveDB(db);
}

module.exports = { initDB, getDB, persist, now, localNowISO };
