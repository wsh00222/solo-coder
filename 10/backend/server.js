const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./src/db');
const { seedIfEmpty } = require('./src/seed');
const bookRoutes = require('./src/routes/bookRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB();
seedIfEmpty();

app.use('/api/books', bookRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '书籍管理服务运行正常' });
});

app.listen(PORT, () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`);
});
