const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  hasAnyRecords,
  generateSampleData,
  getAllRecords,
  addRecord,
  updateRecord,
  deleteRecord
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

if (!hasAnyRecords()) {
  console.log('数据库为空，正在生成示例数据...');
  generateSampleData();
  console.log('示例数据生成完成');
}

app.get('/api/records', (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const records = getAllRecords({ category, startDate, endDate });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/records', (req, res) => {
  try {
    const { amount, category, date, note } = req.body;

    if (amount === undefined || amount === null || amount === '' || Number(amount) === 0) {
      return res.status(400).json({ error: '金额不能为空或零' });
    }

    const record = addRecord({
      amount: Number(amount),
      category: category || '其他',
      date: date || new Date().toISOString().split('T')[0],
      note
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, date, note } = req.body;

    if (amount === undefined || amount === null || amount === '' || Number(amount) === 0) {
      return res.status(400).json({ error: '金额不能为空或零' });
    }

    const record = updateRecord(id, {
      amount: Number(amount),
      category: category || '其他',
      date,
      note
    });

    if (!record) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteRecord(id);

    if (!success) {
      return res.status(404).json({ error: '记录不存在' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
