const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'notes.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DEFAULT_DB = {
  notes: [],
  tags: [],
  noteTags: [],
  _counters: { noteId: 0, tagId: 0 }
};

let dbCache = null;
let writeTimer = null;

function loadDB() {
  if (dbCache) return dbCache;
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf-8');
      dbCache = JSON.parse(raw);
      if (!dbCache.notes) dbCache.notes = [];
      if (!dbCache.tags) dbCache.tags = [];
      if (!dbCache.noteTags) dbCache.noteTags = [];
      if (!dbCache._counters) dbCache._counters = { noteId: 0, tagId: 0 };
    } else {
      dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  } catch (err) {
    console.error('加载数据库失败:', err.message);
    dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  return dbCache;
}

function saveDB() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(dbCache, null, 2), 'utf-8');
    } catch (err) {
      console.error('保存数据库失败:', err.message);
    }
    writeTimer = null;
  }, 30);
}

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function now() {
  return formatDate(new Date());
}

function nextNoteId() {
  const db = loadDB();
  db._counters.noteId = (db._counters.noteId || 0) + 1;
  saveDB();
  return db._counters.noteId;
}

function nextTagId() {
  const db = loadDB();
  db._counters.tagId = (db._counters.tagId || 0) + 1;
  saveDB();
  return db._counters.tagId;
}

function initDatabase() {
  loadDB();
}

function seedSampleNotes() {
  const db = loadDB();
  if (db.notes.length > 0) return;

  const sampleNotes = [
    {
      title: '欢迎使用知识笔记',
      content: `这是一款轻量级的个人知识笔记管理工具。

## 主要功能
- 📝 创建、编辑、删除笔记
- 🏷️ 标签分类管理
- 🔍 关键词搜索
- 📊 统计信息面板

## 快速开始
1. 点击右上角"新建笔记"按钮
2. 输入标题和内容
3. 添加标签便于分类
4. 使用搜索框快速查找

官方网站: https://example.com
`,
      tags: ['入门', '使用指南'],
      daysAgo: 0
    },
    {
      title: 'JavaScript 异步编程总结',
      content: `JavaScript 异步编程的几种方式：

1. 回调函数 (Callback)
   最基础的异步方式，但容易产生回调地狱。

2. Promise
   then/catch 链式调用，状态一旦改变不可逆转。
   参考：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise

3. async/await
   基于 Promise 的语法糖，让异步代码看起来像同步。

async function fetchData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
`,
      tags: ['JavaScript', '编程'],
      daysAgo: 2
    },
    {
      title: '本周学习计划',
      content: `## 周一至周三
- 复习 Vue 3 Composition API
- 完成项目原型设计

## 周四至周五
- 后端 API 开发
- 数据库表结构优化

## 周末
- 代码 Review
- 写技术博客一篇

相关资源: https://vuejs.org
`,
      tags: ['计划', '学习'],
      daysAgo: 5
    }
  ];

  for (const sample of sampleNotes) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - sample.daysAgo);
    createdAt.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60));
    const createdStr = formatDate(createdAt);

    const updatedAt = new Date(createdAt);
    updatedAt.setHours(updatedAt.getHours() + Math.floor(Math.random() * 3) + 1);
    const updatedStr = formatDate(updatedAt);

    const noteId = nextNoteId();
    db.notes.push({
      id: noteId,
      title: sample.title,
      content: sample.content,
      created_at: createdStr,
      updated_at: updatedStr
    });

    for (const tagName of sample.tags) {
      let tag = db.tags.find(t => t.name === tagName);
      if (!tag) {
        const tagId = nextTagId();
        tag = { id: tagId, name: tagName };
        db.tags.push(tag);
      }
      if (!db.noteTags.find(nt => nt.note_id === noteId && nt.tag_id === tag.id)) {
        db.noteTags.push({ note_id: noteId, tag_id: tag.id });
      }
    }
  }

  saveDB();
  console.log('已生成 3 篇示例笔记');
}

function getNoteWithTags(noteId) {
  const db = loadDB();
  const note = db.notes.find(n => n.id === Number(noteId));
  if (!note) return null;

  const tagIds = db.noteTags
    .filter(nt => nt.note_id === note.id)
    .map(nt => nt.tag_id);
  const tags = db.tags
    .filter(t => tagIds.includes(t.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { ...note, tags };
}

function getTagUsageCount(tagId) {
  const db = loadDB();
  return db.noteTags.filter(nt => nt.tag_id === tagId).length;
}

function getAllNotesWithTags() {
  const db = loadDB();
  return db.notes.map(note => {
    const tagIds = db.noteTags
      .filter(nt => nt.note_id === note.id)
      .map(nt => nt.tag_id);
    const tags = db.tags.filter(t => tagIds.includes(t.id)).sort((a, b) => a.name.localeCompare(b.name));
    const summary = note.content.replace(/[\r\n]+/g, ' ').slice(0, 50) + (note.content.length > 50 ? '...' : '');
    return { ...note, tags, summary };
  }).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}

module.exports = {
  loadDB,
  saveDB,
  initDatabase,
  seedSampleNotes,
  formatDate,
  now,
  nextNoteId,
  nextTagId,
  getNoteWithTags,
  getTagUsageCount,
  getAllNotesWithTags
};
