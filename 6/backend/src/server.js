const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, seedSampleNotes } = require('./models/database');
const notesRoutes = require('./routes/notes');
const tagsRoutes = require('./routes/tags');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

initDatabase();
seedSampleNotes();

app.use('/api/notes', notesRoutes);
app.use('/api/tags', tagsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Notes API is running' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
});
