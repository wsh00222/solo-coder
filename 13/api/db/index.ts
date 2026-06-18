import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fitness.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      goal TEXT NOT NULL CHECK (goal IN ('增肌', '减脂', '保持')),
      weekly_frequency INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      duration INTEGER NOT NULL,
      content TEXT NOT NULL,
      feeling INTEGER CHECK (feeling BETWEEN 1 AND 5),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
      UNIQUE(plan_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_records_plan_id ON records(plan_id);
    CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
  `);
}
