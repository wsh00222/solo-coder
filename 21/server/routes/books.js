const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readBooks, writeBooks } = require('../utils/storage');

const router = express.Router();

const SAMPLE_BOOKS = [
  {
    id: 'sample-1',
    title: '三体',
    author: '刘慈欣',
    year: 2008,
    genre: '科技',
    rating: 5,
    status: '读完'
  },
  {
    id: 'sample-2',
    title: '活着',
    author: '余华',
    year: 1993,
    genre: '小说',
    rating: 4,
    status: '在读'
  },
  {
    id: 'sample-3',
    title: '小家，越住越大',
    author: '逯薇',
    year: 2016,
    genre: '生活',
    rating: 4,
    status: '想读'
  },
  {
    id: 'sample-4',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    year: 2014,
    genre: '其他',
    rating: 5,
    status: '读完'
  }
];

router.get('/init', (req, res) => {
  let books = readBooks();
  if (books.length === 0) {
    books = SAMPLE_BOOKS.map(book => ({
      ...book,
      id: book.id.startsWith('sample') ? uuidv4() : book.id
    }));
    writeBooks(books);
  }
  res.json({ books, initialized: books.length > 0 });
});

router.get('/', (req, res) => {
  const books = readBooks();
  res.json(books);
});

router.get('/:id', (req, res) => {
  const books = readBooks();
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: '书籍不存在' });
  }
  res.json(book);
});

router.post('/', (req, res) => {
  const { title, author, year, genre, rating, status } = req.body;

  if (!title || !author || !year || !genre || rating === undefined || !status) {
    return res.status(400).json({ error: '所有字段均为必填项' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: '评分必须为 1-5 的整数' });
  }

  const validGenres = ['小说', '科技', '生活', '其他'];
  const validStatuses = ['想读', '在读', '读完'];

  if (!validGenres.includes(genre)) {
    return res.status(400).json({ error: '类型无效，必须为：小说/科技/生活/其他' });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: '状态无效，必须为：想读/在读/读完' });
  }

  const books = readBooks();
  const newBook = {
    id: uuidv4(),
    title: String(title).trim(),
    author: String(author).trim(),
    year: parseInt(year, 10),
    genre,
    rating: parseInt(rating, 10),
    status
  };

  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});

router.put('/:id', (req, res) => {
  const { title, author, year, genre, rating, status } = req.body;

  if (!title || !author || !year || !genre || rating === undefined || !status) {
    return res.status(400).json({ error: '所有字段均为必填项' });
  }

  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: '评分必须为 1-5 的整数' });
  }

  const validGenres = ['小说', '科技', '生活', '其他'];
  const validStatuses = ['想读', '在读', '读完'];

  if (!validGenres.includes(genre)) {
    return res.status(400).json({ error: '类型无效，必须为：小说/科技/生活/其他' });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: '状态无效，必须为：想读/在读/读完' });
  }

  const books = readBooks();
  const index = books.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '书籍不存在' });
  }

  books[index] = {
    ...books[index],
    title: String(title).trim(),
    author: String(author).trim(),
    year: parseInt(year, 10),
    genre,
    rating: parseInt(rating, 10),
    status
  };

  writeBooks(books);
  res.json(books[index]);
});

router.delete('/:id', (req, res) => {
  const books = readBooks();
  const index = books.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '书籍不存在' });
  }

  const deletedBook = books.splice(index, 1)[0];
  writeBooks(books);
  res.json({ message: '删除成功', deletedBook });
});

module.exports = router;
