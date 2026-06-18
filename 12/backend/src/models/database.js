const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'events.db');

let db = null;
let SQL = null;

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function nowStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function initDatabase() {
  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      activity_time TEXT NOT NULL,
      location TEXT NOT NULL,
      registration_deadline TEXT NOT NULL,
      max_participants INTEGER NOT NULL,
      description TEXT,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      checked_in INTEGER DEFAULT 0,
      checked_in_at TEXT,
      created_at TEXT
    )
  `);

  saveDatabase();
}

function generateSampleData() {
  const result = db.exec('SELECT COUNT(*) as count FROM activities');
  const count = result[0] ? result[0].values[0][0] : 0;
  if (count > 0) return;

  const now = new Date();
  const futureDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const futureActivity = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const pastActivity = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const pastDeadline = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const fmt = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const n = nowStr();

  db.run(
    `INSERT INTO activities (title, activity_time, location, registration_deadline, max_participants, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      '2026 年度技术交流大会',
      fmt(futureActivity),
      '北京市朝阳区科技园区 A 座 3 层会议室',
      fmt(futureDeadline),
      50,
      '本年度最盛大的技术交流活动，邀请行业资深专家分享前沿技术趋势，涵盖 AI、云原生、大数据等热门领域。欢迎所有技术爱好者报名参加！',
      n, n
    ]
  );
  const id1 = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

  db.run(
    `INSERT INTO activities (title, activity_time, location, registration_deadline, max_participants, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      '春季产品发布会（已结束）',
      fmt(pastActivity),
      '上海市浦东新区世纪大道 100 号会展中心',
      fmt(pastDeadline),
      100,
      '2026 年春季新产品发布会，展示最新研发成果和产品路线图。',
      n, n
    ]
  );
  const id2 = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

  const insertReg = (activityId, name, phone, email, checkedIn, checkedInAt) => {
    db.run(
      `INSERT INTO registrations (activity_id, name, phone, email, checked_in, checked_in_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [activityId, name, phone, email, checkedIn, checkedInAt, nowStr()]
    );
  };

  insertReg(id1, '张三', '13800138001', 'zhangsan@example.com', 0, null);
  insertReg(id1, '李四', '13800138002', 'lisi@example.com', 0, null);
  insertReg(id1, '王五', '13800138003', null, 0, null);
  insertReg(id1, '赵六', '13800138004', 'zhaoliu@example.com', 0, null);

  const pa = fmt(pastActivity);
  insertReg(id2, '钱七', '13900139001', 'qianqi@example.com', 1, pa);
  insertReg(id2, '孙八', '13900139002', 'sunba@example.com', 1, pa);
  insertReg(id2, '周九', '13900139003', null, 0, null);
  insertReg(id2, '吴十', '13900139004', 'wushi@example.com', 1, pa);
  insertReg(id2, '郑十一', '13900139005', 'zheng11@example.com', 0, null);

  saveDatabase();
}

function queryAll(sql, params = []) {
  const results = db.exec(sql, params);
  if (!results || results.length === 0) return [];
  const cols = results[0].columns;
  return results[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  });
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runAndGetLastId(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0].values[0][0];
}

function runAndGetChanges(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  return true;
}

module.exports = {
  initDatabase,
  generateSampleData,
  queryAll,
  queryOne,
  runAndGetLastId,
  runAndGetChanges,
  nowStr
};
