import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes';
import { seedData } from './seed';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

seedData();

app.use('/api', router);

const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
