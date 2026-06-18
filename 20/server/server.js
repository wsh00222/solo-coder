const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4321;
const DB_PATH = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { notes: [] };
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { notes: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function parseTags(tagStr) {
  if (!tagStr) return [];
  return String(tagStr).split(',').map(t => t.trim()).filter(Boolean);
}

function tagsToStr(tags) {
  if (Array.isArray(tags)) return tags.join(',');
  return String(tags || '');
}

function formatNote(n) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    tags: parseTags(n.tags),
    createdAt: n.createdAt,
    updatedAt: n.updatedAt
  };
}

function seedSampleNotes() {
  const db = readDB();
  if (db.notes && db.notes.length > 0) return;

  const now = Date.now();
  db.notes = [
    {
      id: 1,
      title: '欢迎使用笔记管理工具',
      content: `这是一个简洁高效的个人笔记管理工具。

主要功能：
- 创建、编辑、删除笔记
- 按标题搜索
- 按标签筛选
- 查看统计信息

更多资料请访问官方文档：https://example.com/docs

祝你使用愉快！`,
      tags: '教程,入门',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 86400000 * 2
    },
    {
      id: 2,
      title: 'JavaScript 数组常用方法',
      content: `本文整理了 JavaScript 数组中最常用的几个方法：

1. map() - 映射转换
2. filter() - 过滤
3. reduce() - 归并
4. find() - 查找元素
5. includes() - 判断包含

参考链接：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array`,
      tags: '编程,JavaScript',
      createdAt: now - 86400000,
      updatedAt: now - 86400000
    },
    {
      id: 3,
      title: '本周工作计划',
      content: `周一：完成项目需求评审
周二：编写 API 接口文档，参考 https://swagger.io/
周三：前端页面开发
周四：前后端联调
周五：代码评审和测试

周末安排休息，保持良好工作节奏。`,
      tags: '工作,计划',
      createdAt: now - 3600000,
      updatedAt: now - 3600000
    }
  ];
  writeDB(db);
  console.log('已生成 3 篇示例笔记');
}

seedSampleNotes();

function noteHasTag(note, tag) {
  const tags = parseTags(note.tags);
  return tags.includes(tag);
}

function filterNotes(notes, { search, tag }) {
  return notes.filter(n => {
    if (search && !n.title.toLowerCase().includes(String(search).toLowerCase())) {
      return false;
    }
    if (tag && !noteHasTag(n, tag)) {
      return false;
    }
    return true;
  });
}

function collectAllTags(notes) {
  const set = new Set();
  for (const n of notes) {
    for (const t of parseTags(n.tags)) set.add(t);
  }
  return Array.from(set);
}

app.get('/api/notes', (req, res) => {
  const { search = '', tag = '', page = '1', pageSize = '5' } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const sizeNum = Math.max(1, parseInt(pageSize) || 5);

  const db = readDB();
  const allNotes = [...(db.notes || [])].sort((a, b) => b.updatedAt - a.updatedAt);
  const filtered = filterNotes(allNotes, { search, tag });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / sizeNum));
  const start = (pageNum - 1) * sizeNum;
  const pageNotes = filtered.slice(start, start + sizeNum).map(formatNote);

  const isFiltered = Boolean(search || tag);
  const sevenDaysAgo = Date.now() - 7 * 86400000;

  const last7DaysAll = allNotes.filter(n => n.createdAt >= sevenDaysAgo).length;
  const last7DaysFiltered = filtered.filter(n => n.createdAt >= sevenDaysAgo).length;

  const globalTagTotal = collectAllTags(allNotes).length;
  const visibleTags = isFiltered ? collectAllTags(filtered) : collectAllTags(allNotes);

  res.json({
    notes: pageNotes,
    total,
    page: pageNum,
    pageSize: sizeNum,
    totalPages,
    allTags: visibleTags,
    stats: {
      totalNotes: isFiltered ? total : allNotes.length,
      isFiltered,
      globalTotalNotes: allNotes.length,
      tagTotal: visibleTags.length,
      globalTagTotal,
      last7Days: isFiltered ? last7DaysFiltered : last7DaysAll,
      globalLast7Days: last7DaysAll,
      filteredLast7Days: isFiltered ? last7DaysFiltered : null
    }
  });
});

app.get('/api/notes/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const note = (db.notes || []).find(n => n.id === id);
  if (!note) {
    return res.status(404).json({ error: '笔记不存在' });
  }
  res.json(formatNote(note));
});

app.post('/api/notes', (req, res) => {
  const { title, content = '', tags = [] } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: '标题不能为空' });
  }
  const db = readDB();
  const maxId = (db.notes || []).reduce((m, n) => Math.max(m, n.id || 0), 0);
  const now = Date.now();
  const newNote = {
    id: maxId + 1,
    title: String(title).trim(),
    content: String(content || ''),
    tags: tagsToStr(tags),
    createdAt: now,
    updatedAt: now
  };
  db.notes = db.notes || [];
  db.notes.push(newNote);
  writeDB(db);
  res.status(201).json(formatNote(newNote));
});

app.put('/api/notes/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = (db.notes || []).findIndex(n => n.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: '笔记不存在' });
  }
  const { title, content, tags } = req.body || {};
  if (title !== undefined && !String(title).trim()) {
    return res.status(400).json({ error: '标题不能为空' });
  }
  const existing = db.notes[idx];
  const updated = {
    ...existing,
    title: title !== undefined ? String(title).trim() : existing.title,
    content: content !== undefined ? String(content) : existing.content,
    tags: tags !== undefined ? tagsToStr(tags) : existing.tags,
    updatedAt: Date.now()
  };
  db.notes[idx] = updated;
  writeDB(db);
  res.json(formatNote(updated));
});

app.delete('/api/notes/:id', (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = (db.notes || []).findIndex(n => n.id === id);
  if (idx < 0) {
    return res.status(404).json({ error: '笔记不存在' });
  }
  db.notes.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`笔记管理 API 服务已启动: http://localhost:${PORT}`);
});
