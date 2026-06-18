const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'habit-tracker-secret-key-2026';

let dbCache = null;
let lastModified = 0;

const defaultData = () => ({
  users: [],
  habits: [],
  checkins: [],
  nextUserId: 1,
  nextHabitId: 1,
  nextCheckinId: 1,
});

const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    const data = defaultData();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    dbCache = data;
    lastModified = Date.now();
    return data;
  }

  const stat = fs.statSync(dbPath);
  if (dbCache && stat.mtimeMs <= lastModified) {
    return dbCache;
  }

  try {
    const content = fs.readFileSync(dbPath, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users) parsed.users = [];
    if (!parsed.nextUserId) parsed.nextUserId = 1;
    dbCache = parsed;
    lastModified = Date.now();
    return dbCache;
  } catch (e) {
    console.error('读取数据库文件失败，使用默认数据:', e.message);
    const data = defaultData();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    dbCache = data;
    lastModified = Date.now();
    return data;
  }
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  dbCache = data;
  lastModified = Date.now();
};

const getDb = () => {
  return readDb();
};

const getNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const createTables = () => {
  readDb();
};

const seedDefaultDataForUser = (userId) => {
  const db = getDb();
  const userHabits = db.habits.filter(h => h.user_id === userId);
  if (userHabits.length > 0) return;

  const today = new Date();
  const habits = [
    { name: '每日阅读30分钟', frequency_type: 'daily', frequency_count: 1, color: '#3B82F6' },
    { name: '运动健身', frequency_type: 'weekly', frequency_count: 4, color: '#10B981' },
    { name: '学习英语单词', frequency_type: 'monthly', frequency_count: 20, color: '#F59E0B' }
  ];

  const now = getNow();
  const habitIds = [];

  for (const habit of habits) {
    const id = db.nextHabitId++;
    habitIds.push(id);
    db.habits.push({
      id,
      user_id: userId,
      ...habit,
      created_at: now,
      updated_at: now,
    });
  }

  for (let i = 0; i < habitIds.length; i++) {
    const habitId = habitIds[i];
    const checkinCount = Math.floor(Math.random() * 5) + 2;
    const usedDates = new Set();
    
    for (let j = 0; j < checkinCount; j++) {
      let daysAgo;
      let dateStr;
      do {
        daysAgo = Math.floor(Math.random() * 7);
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        dateStr = date.toISOString().split('T')[0];
      } while (usedDates.has(dateStr) && usedDates.size < 7);
      
      if (!usedDates.has(dateStr)) {
        usedDates.add(dateStr);
        db.checkins.push({
          id: db.nextCheckinId++,
          habit_id: habitId,
          checkin_date: dateStr,
          created_at: now,
        });
      }
    }
  }

  writeDb(db);
  console.log(`已为用户 ${userId} 生成默认示例数据`);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    try {
      createTables();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  getDb,
  writeDb,
  getNow,
  initDatabase,
  seedDefaultDataForUser,
  hashPassword,
  comparePassword,
  JWT_SECRET,
};
