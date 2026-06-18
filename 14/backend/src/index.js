const express = require('express');
const cors = require('cors');
const { initDatabase, isDatabaseEmpty, seedSampleData } = require('./models/database');
const equipmentRoutes = require('./routes/equipment');
const borrowRoutes = require('./routes/borrow');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

initDatabase();
if (isDatabaseEmpty()) {
  console.log('[DB] 数据库为空，正在初始化示例数据...');
  seedSampleData();
  console.log('[DB] 示例数据初始化完成');
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '设备借用登记系统 API 运行正常', timestamp: new Date().toISOString() });
});

app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow', borrowRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API 路由不存在', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log('============================================');
  console.log('  设备借用登记系统 - 后端服务');
  console.log('============================================');
  console.log(`  服务地址:  http://localhost:${PORT}`);
  console.log(`  健康检查:  http://localhost:${PORT}/api/health`);
  console.log(`  API 前缀:  http://localhost:${PORT}/api`);
  console.log('============================================');
  console.log('  数据库: SQLite (backend/src/data/equipment.db)');
  console.log('============================================');
});

module.exports = app;
