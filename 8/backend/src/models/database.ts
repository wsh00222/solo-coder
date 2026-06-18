import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'proposals.db');
const db = new sqlite3.Database(dbPath);

function run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

async function initDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      proposer TEXT NOT NULL,
      deadline DATETIME NOT NULL,
      attachmentUrl TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      proposalId INTEGER NOT NULL,
      voteType TEXT NOT NULL CHECK(voteType IN ('approve', 'reject')),
      nickname TEXT,
      voterIp TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proposalId) REFERENCES proposals(id) ON DELETE CASCADE,
      UNIQUE(proposalId, voterIp)
    )
  `);

  await run('CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status)');
  await run('CREATE INDEX IF NOT EXISTS idx_proposals_proposer ON proposals(proposer)');
  await run('CREATE INDEX IF NOT EXISTS idx_proposals_createdAt ON proposals(createdAt DESC)');
  await run('CREATE INDEX IF NOT EXISTS idx_votes_proposalId ON votes(proposalId)');
}

async function seedData() {
  const countResult = await get<{ count: number }>('SELECT COUNT(*) as count FROM proposals');
  
  if (!countResult || countResult.count === 0) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const result1 = await run(
      `INSERT INTO proposals (title, description, proposer, deadline, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        '关于采用新前端框架的提案',
        '建议团队在下一个项目中采用 React + TypeScript 技术栈，以提高开发效率和代码质量。新框架具有更好的类型安全、更丰富的生态系统和更强的社区支持。',
        '张三',
        futureDate.toISOString(),
        'open',
        now.toISOString(),
        now.toISOString(),
      ]
    );
    const proposal1Id = result1.lastID;

    const result2 = await run(
      `INSERT INTO proposals (title, description, proposer, deadline, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        '远程办公政策调整',
        '建议将每周远程办公天数从2天增加到3天，以提高员工工作生活平衡。研究表明，适当的远程办公可以提高生产力和员工满意度。',
        '李四',
        pastDate.toISOString(),
        'closed',
        tenDaysAgo.toISOString(),
        tenDaysAgo.toISOString(),
      ]
    );
    const proposal2Id = result2.lastID;

    const votes1 = [
      { voteType: 'approve' as const, nickname: '王五', ip: '192.168.1.1' },
      { voteType: 'approve' as const, nickname: '赵六', ip: '192.168.1.2' },
      { voteType: 'reject' as const, nickname: '钱七', ip: '192.168.1.3' },
      { voteType: 'approve' as const, nickname: undefined, ip: '192.168.1.4' },
    ];

    const votes2 = [
      { voteType: 'approve' as const, nickname: '员工A', ip: '192.168.1.5' },
      { voteType: 'approve' as const, nickname: '员工B', ip: '192.168.1.6' },
      { voteType: 'reject' as const, nickname: undefined, ip: '192.168.1.7' },
    ];

    for (const v of votes1) {
      await run(
        'INSERT INTO votes (proposalId, voteType, nickname, voterIp) VALUES (?, ?, ?, ?)',
        [proposal1Id, v.voteType, v.nickname, v.ip]
      );
    }

    for (const v of votes2) {
      await run(
        'INSERT INTO votes (proposalId, voteType, nickname, voterIp) VALUES (?, ?, ?, ?)',
        [proposal2Id, v.voteType, v.nickname, v.ip]
      );
    }

    console.log('数据库初始化完成，已生成示例数据');
  }
}

async function initialize() {
  await initDatabase();
  await seedData();
}

let initPromise: Promise<void> | null = null;

function getInitPromise() {
  if (!initPromise) {
    initPromise = initialize();
  }
  return initPromise;
}

export { run, get, all, getInitPromise };
export default db;
