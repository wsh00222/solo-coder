import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';
import plansRouter from './routes/plans.js';
import statsRouter from './routes/stats.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDatabase();
seedDatabase();

app.use('/api/plans', plansRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Study Tracker API is running' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
