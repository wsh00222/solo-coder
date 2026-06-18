import express from 'express';
import cors from 'cors';
import { initDatabase } from './db';
import { seedDatabaseIfEmpty } from './services/seedService';
import plansRouter from './routes/plans';
import itinerariesRouter from './routes/itineraries';

const app = express();

app.use(cors());
app.use(express.json());

initDatabase();
seedDatabaseIfEmpty();

app.use('/api/plans', plansRouter);
app.use('/api/plans/:planId/itineraries', itinerariesRouter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Travel Planner API is running' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

export default app;
