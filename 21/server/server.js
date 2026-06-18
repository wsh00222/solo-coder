const express = require('express');
const cors = require('cors');
const booksRouter = require('./routes/books');
const { ensureDataFile } = require('./utils/storage');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

ensureDataFile();

app.use('/api/books', booksRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '书籍收藏管理 API 运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`API 文档: GET /api/books - 获取所有书籍`);
  console.log(`         POST /api/books - 新增书籍`);
  console.log(`         GET /api/books/:id - 获取单本书籍`);
  console.log(`         PUT /api/books/:id - 更新书籍`);
  console.log(`         DELETE /api/books/:id - 删除书籍`);
});
