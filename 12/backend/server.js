const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const StatsController = require('./src/controllers/statsController');
const db = require('./src/models/database');

async function start() {
  await db.initDatabase();
  db.generateSampleData();

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  app.get('/api/stats', StatsController.getGlobalStats);
  app.use('/api', routes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`活动管理系统后端服务已启动: http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
