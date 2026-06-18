const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'movies.json');

const SAMPLE_MOVIES = [
  {
    id: 1,
    title: '肖申克的救赎',
    director: '弗兰克·德拉邦特',
    year: 1994,
    genre: '剧情',
    rating: 10,
    watchDate: '2023-06-15',
    status: '已看',
    notes: '希望是美好的，也许是人间至善，而美好的事物永不消逝。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: '星际穿越',
    director: '克里斯托弗·诺兰',
    year: 2014,
    genre: '科幻',
    rating: 9,
    watchDate: '2024-03-20',
    status: '二刷',
    notes: '不要温和地走进那个良夜。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: '盗梦空间',
    director: '克里斯托弗·诺兰',
    year: 2010,
    genre: '科幻',
    rating: 9,
    watchDate: '2023-11-08',
    status: '已看',
    notes: '多层梦境的烧脑神作。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: '流浪地球3',
    director: '郭帆',
    year: 2025,
    genre: '科幻',
    rating: null,
    watchDate: null,
    status: '想看',
    notes: '期待中国科幻的又一里程碑。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: '疯狂的石头',
    director: '宁浩',
    year: 2006,
    genre: '喜剧',
    rating: 8,
    watchDate: '2024-01-12',
    status: '已看',
    notes: '国产黑色幽默的巅峰之作。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let store = { movies: [], nextId: 6 };
let saveTimer = null;

function load() {
  try {
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf-8');
      const data = JSON.parse(content);
      store.movies = data.movies || [];
      store.nextId = data.nextId || (store.movies.length ? Math.max(...store.movies.map(m => m.id)) + 1 : 1);
    } else {
      store.movies = JSON.parse(JSON.stringify(SAMPLE_MOVIES));
      store.nextId = 6;
      saveNow();
      console.log('数据库为空，已自动插入 5 部示例电影数据');
    }
  } catch (err) {
    console.error('加载数据失败，使用示例数据:', err.message);
    store.movies = JSON.parse(JSON.stringify(SAMPLE_MOVIES));
    store.nextId = 6;
  }
}

function saveNow() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('保存数据失败:', err.message);
  }
}

function save() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 100);
}

function initDatabase() {
  load();
}

function getStore() {
  return store;
}

function persist() {
  save();
}

module.exports = { initDatabase, getStore, persist };
