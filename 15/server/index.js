const express = require('express');
const cors = require('cors');
const path = require('path');
const movieRoutes = require('./src/routes/movieRoutes');
const { initDatabase } = require('./src/db/database');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/movies', movieRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '电影收藏服务运行中' });
});

app.listen(PORT, () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`);
});
