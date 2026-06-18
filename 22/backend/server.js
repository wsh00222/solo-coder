const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data.json');

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('读取数据文件失败', err);
  }
  return null;
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('写入数据文件失败', err);
    return false;
  }
}

function initData() {
  const existing = readData();
  if (existing && existing.books && existing.books.length > 0) {
    return existing;
  }

  const initialData = {
    nextId: 5,
    books: [
      {
        id: 1,
        title: '三体',
        author: '刘慈欣',
        year: 2008,
        genre: '小说',
        rating: 5,
        status: '读完',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: '深入理解计算机系统',
        author: 'Randal E. Bryant',
        year: 2016,
        genre: '科技',
        rating: 5,
        status: '在读',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: '家常菜大全',
        author: '美食生活编辑部',
        year: 2020,
        genre: '生活',
        rating: 3,
        status: '想读',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        title: '人类简史',
        author: '尤瓦尔·赫拉利',
        year: 2014,
        genre: '其他',
        rating: 4,
        status: '读完',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };

  writeData(initialData);
  console.log('已初始化 4 本示例书籍');
  return initialData;
}

const dataStore = initData();

app.get('/api/stats', (req, res) => {
  const { books } = dataStore;
  const total = books.length;
  
  const statusMap = { 想读: 0, 在读: 0, 读完: 0 };
  let totalRating = 0;

  books.forEach(book => {
    if (statusMap[book.status] !== undefined) {
      statusMap[book.status]++;
    }
    totalRating += book.rating;
  });

  const avgRating = total > 0 ? parseFloat((totalRating / total).toFixed(1)) : 0;

  res.json({
    total,
    status: statusMap,
    avgRating
  });
});

app.get('/api/books', (req, res) => {
  const { status, genre, sortBy = 'id', sortOrder = 'desc', page = 1, pageSize = 6 } = req.query;

  let filteredBooks = [...dataStore.books];

  if (status && status !== 'all') {
    filteredBooks = filteredBooks.filter(b => b.status === status);
  }
  if (genre && genre !== 'all') {
    filteredBooks = filteredBooks.filter(b => b.genre === genre);
  }

  const validSortColumns = ['title', 'rating', 'year', 'id'];
  const validSortOrders = ['asc', 'desc'];
  const column = validSortColumns.includes(sortBy) ? sortBy : 'id';
  const order = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

  filteredBooks.sort((a, b) => {
    let valA = a[column];
    let valB = b[column];

    if (column === 'title') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filteredBooks.length;
  const currentPage = Math.max(1, parseInt(page));
  const size = Math.max(1, parseInt(pageSize));
  const offset = (currentPage - 1) * size;
  const pagedBooks = filteredBooks.slice(offset, offset + size);

  res.json({
    books: pagedBooks,
    total,
    page: currentPage,
    pageSize: size,
    totalPages: Math.ceil(total / size)
  });
});

app.get('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = dataStore.books.find(b => b.id === id);
  
  if (!book) {
    return res.status(404).json({ error: '书籍不存在' });
  }
  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, year, genre, rating, status } = req.body;

  if (!title || !author || !genre || rating === undefined || !status) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: '评分必须为 1-5 的整数' });
  }

  const newBook = {
    id: dataStore.nextId++,
    title,
    author,
    year: year ? parseInt(year) : null,
    genre,
    rating: ratingNum,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dataStore.books.push(newBook);
  writeData(dataStore);

  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = dataStore.books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: '书籍不存在' });
  }

  const existing = dataStore.books[bookIndex];
  const { title, author, year, genre, rating, status } = req.body;

  if (rating !== undefined) {
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: '评分必须为 1-5 的整数' });
    }
  }

  const updated = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    author: author !== undefined ? author : existing.author,
    year: year !== undefined ? (year ? parseInt(year) : null) : existing.year,
    genre: genre !== undefined ? genre : existing.genre,
    rating: rating !== undefined ? parseInt(rating) : existing.rating,
    status: status !== undefined ? status : existing.status,
    updatedAt: new Date().toISOString()
  };

  dataStore.books[bookIndex] = updated;
  writeData(dataStore);

  res.json(updated);
});

app.delete('/api/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = dataStore.books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: '书籍不存在' });
  }

  dataStore.books.splice(bookIndex, 1);
  writeData(dataStore);

  res.json({ message: '删除成功' });
});

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
