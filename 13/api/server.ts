import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { initDatabase } from './db';
import { seedSampleDataIfEmpty } from './db/seed';
import plansRouter from './routes/plans';
import recordsRouter from './routes/records';
import statsRouter from './routes/stats';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function startServer() {
  await initDatabase();
  await seedSampleDataIfEmpty();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/plans', plansRouter);
  app.use('/api/records', recordsRouter);
  app.use('/api/stats', statsRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Not Found' });
  });

  app.listen(PORT, () => {
    console.log(`✅ Fitness API server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
