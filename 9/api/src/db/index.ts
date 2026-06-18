import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'travel-planner.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      destination TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      companions TEXT,
      budget REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS itineraries (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL CHECK(time_slot IN ('morning', 'afternoon', 'evening')),
      activity TEXT NOT NULL,
      location TEXT NOT NULL,
      transportation TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_itineraries_plan_id ON itineraries(plan_id);
    CREATE INDEX IF NOT EXISTS idx_itineraries_date ON itineraries(date);
  `);
}
