import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'fitness.db');

let db: Database | null = null;
type SqlJsStaticType = typeof initSqlJs extends (config: any) => Promise<infer T> ? T : never;
let SQL: SqlJsStaticType | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const sqlJsPkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'node_modules', 'sql.js', 'package.json'), 'utf8'));
  const wasmDir = path.resolve(process.cwd(), 'node_modules', 'sql.js', 'dist');

  SQL = await initSqlJs({
    locateFile: (file: string) => path.join(wasmDir, file),
  });

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  return db;
}

export function saveDb() {
  if (!db) return;
  const data = db.export();
  const buf = Buffer.from(data);
  fs.writeFileSync(dbPath, buf);
}

let saveTimer: any = null;
export function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDb();
  }, 200);
}

export async function initDatabase() {
  const database = await getDb();
  database.run(`
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
  `);
  scheduleSave();
}

process.on('exit', () => saveDb());
process.on('SIGINT', () => { saveDb(); process.exit(); });
