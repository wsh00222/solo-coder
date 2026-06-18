const { getDB, persist, now, localNowISO } = require('./db');

function seedIfEmpty() {
  const db = getDB();
  if (db.books.length > 0) return;

  console.log('数据库为空，正在生成示例数据...');

  const dt = new Date();
  const y = dt.getFullYear();
  const m = dt.getMonth();
  const d = dt.getDate();
  const hh = dt.getHours();
  const mm = dt.getMinutes();

  const fmt = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const created1 = fmt(new Date(y, m, Math.max(1, d - 20), 10, 0));
  const created2 = fmt(new Date(y, m, Math.max(1, d - 12), 15, 30));
  const created3 = fmt(new Date(y, Math.max(0, m - 2), 15, 9, 0));
  const created4 = fmt(new Date(y, m, Math.max(1, d - 3), 20, 0));
  const created5 = fmt(new Date(y, m, Math.max(1, d - 8), 14, 0));
  const updated = now();

  db.books.push(
    {
      id: 1,
      title: '三体',
      author: '刘慈欣',
      publish_year: 2008,
      genre: 'novel',
      rating: 5,
      status: 'finished',
      current_pages: 302,
      total_pages: 302,
      created_at: created1,
      updated_at: created1,
    },
    {
      id: 2,
      title: '深入理解计算机系统',
      author: 'Randal E. Bryant',
      publish_year: 2016,
      genre: 'tech',
      rating: 4,
      status: 'reading',
      current_pages: 256,
      total_pages: 738,
      created_at: created2,
      updated_at: updated,
    },
    {
      id: 3,
      title: '活着',
      author: '余华',
      publish_year: 1993,
      genre: 'novel',
      rating: 5,
      status: 'finished',
      current_pages: 191,
      total_pages: 191,
      created_at: created3,
      updated_at: created3,
    },
    {
      id: 4,
      title: '烹饪的艺术',
      author: '美食家',
      publish_year: 2022,
      genre: 'life',
      rating: 0,
      status: 'want_to_read',
      current_pages: 0,
      total_pages: null,
      created_at: created4,
      updated_at: created4,
    },
    {
      id: 5,
      title: '人类简史',
      author: '尤瓦尔·赫拉利',
      publish_year: 2014,
      genre: 'other',
      rating: 4,
      status: 'reading',
      current_pages: 150,
      total_pages: 440,
      created_at: created5,
      updated_at: updated,
    }
  );

  db._meta.bookIdSeq = 5;

  const h1 = fmt(new Date(y, m, Math.max(1, d - 5), 14, 30));
  const h2 = fmt(new Date(y, m, Math.max(1, d - 2), 20, 15));
  const h3 = fmt(new Date(y, m, d, Math.max(0, hh), Math.max(0, mm - 35)));
  const h4 = fmt(new Date(y, m, Math.max(1, d - 3), 9, 0));
  const h5 = fmt(new Date(y, m, Math.max(1, d - 1), 21, 45));

  db.readingHistory.push(
    { id: 1, book_id: 2, current_pages: 100, total_pages: 738, progress_percent: 13.55, read_date: h1 },
    { id: 2, book_id: 2, current_pages: 180, total_pages: 738, progress_percent: 24.39, read_date: h2 },
    { id: 3, book_id: 2, current_pages: 256, total_pages: 738, progress_percent: 34.69, read_date: h3 },
    { id: 4, book_id: 5, current_pages: 80, total_pages: 440, progress_percent: 18.18, read_date: h4 },
    { id: 5, book_id: 5, current_pages: 150, total_pages: 440, progress_percent: 34.09, read_date: h5 },
  );

  db._meta.historyIdSeq = 5;
  persist();
  console.log('示例数据生成完成！');
}

module.exports = { seedIfEmpty };
