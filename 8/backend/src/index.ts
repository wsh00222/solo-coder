import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import proposalRoutes from './routes/proposalRoutes';
import voteRoutes from './routes/voteRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import { getInitPromise } from './models/database';

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/proposals', proposalRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '团队提案投票决策工具 API 运行正常' });
});

async function startServer() {
  try {
    await getInitPromise();
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📋 API 文档:`);
      console.log(`   GET  /api/health - 健康检查`);
      console.log(`   GET  /api/proposals - 获取提案列表`);
      console.log(`   GET  /api/proposals/:id - 获取提案详情`);
      console.log(`   POST /api/proposals - 创建提案`);
      console.log(`   PUT  /api/proposals/:id - 更新提案`);
      console.log(`   DELETE /api/proposals/:id - 删除提案`);
      console.log(`   GET  /api/proposals/proposers - 获取所有提案人`);
      console.log(`   GET  /api/votes/:proposalId - 获取用户投票`);
      console.log(`   POST /api/votes/:proposalId - 提交投票`);
      console.log(`   GET  /api/statistics - 获取统计数据`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

export default app;
