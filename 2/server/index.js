const express = require('express');
const cors = require('cors');
const path = require('path');
const surveyRoutes = require('./routes/surveys');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', surveyRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, data: null, msg: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Survey server is running on http://localhost:${PORT}`);
});
