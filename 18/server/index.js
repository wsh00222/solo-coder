const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'kanban.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL CHECK(status IN ('todo', 'in_progress', 'done')),
    priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const seedTasks = [
  {
    title: '完成产品需求文档',
    description: '整理本周迭代的所有功能需求，撰写PRD文档并同步给团队成员评审。',
    status: 'todo',
    priority: 'high'
  },
  {
    title: '设计登录页面 UI',
    description: '按照新版设计规范输出登录页、注册页、忘记密码页的高保真设计稿。',
    status: 'in_progress',
    priority: 'medium'
  },
  {
    title: '修复首页数据加载慢的问题',
    description: '排查接口响应时间长的原因，优化 SQL 查询并增加缓存策略。',
    status: 'done',
    priority: 'high'
  }
];

function seedDatabaseIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM tasks').get().cnt;
  if (count === 0) {
    const stmt = db.prepare(
      'INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)'
    );
    const insertMany = db.transaction((tasks) => {
      for (const t of tasks) {
        stmt.run(t.title, t.description, t.status, t.priority);
      }
    });
    insertMany(seedTasks);
  }
}
seedDatabaseIfEmpty();

app.get('/api/tasks', (req, res) => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(rows);
});

app.post('/api/tasks', (req, res) => {
  const { title, description = '', status = 'todo', priority = 'medium' } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: '标题不能为空' });
  }

  const validStatus = ['todo', 'in_progress', 'done'];
  const validPriority = ['high', 'medium', 'low'];
  if (!validStatus.includes(status) || !validPriority.includes(priority)) {
    return res.status(400).json({ error: '状态或优先级参数无效' });
  }

  const info = db
    .prepare(
      'INSERT INTO tasks (title, description, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
    )
    .run(title.trim(), description, status, priority);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body || {};

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '任务不存在' });
  }

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  const validStatus = ['todo', 'in_progress', 'done'];
  const validPriority = ['high', 'medium', 'low'];
  if (status && !validStatus.includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }
  if (priority && !validPriority.includes(priority)) {
    return res.status(400).json({ error: '无效的优先级' });
  }

  const newTitle = title !== undefined ? title.trim() : existing.title;
  const newDesc = description !== undefined ? description : existing.description;
  const newStatus = status || existing.status;
  const newPriority = priority || existing.priority;

  db.prepare(
    'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(newTitle, newDesc, newStatus, newPriority, id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: '任务不存在' });
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.json({ success: true, id: Number(id) });
});

app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS total FROM tasks').get().total;
  const byStatus = db
    .prepare("SELECT status, COUNT(*) AS cnt FROM tasks GROUP BY status")
    .all();
  const stats = {
    total,
    todo: 0,
    in_progress: 0,
    done: 0
  };
  byStatus.forEach((r) => {
    stats[r.status] = r.cnt;
  });
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`Kanban API server running at http://localhost:${PORT}`);
});
