const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const DEPARTMENTS = ['研发', '市场', '运营', '其他'];

function validatePhone(phone) {
  return /^\d{11}$/.test(phone);
}

function validateEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get('/api/members', (req, res) => {
  const { department, keyword } = req.query;
  const members = db.getAllMembers({ department, keyword });
  res.json(members);
});

app.get('/api/members/stats', (req, res) => {
  const stats = db.getStats();
  res.json(stats);
});

app.get('/api/members/:id', (req, res) => {
  const member = db.getMemberById(req.params.id);
  if (!member) {
    return res.status(404).json({ error: '成员不存在' });
  }
  res.json(member);
});

app.post('/api/members', (req, res) => {
  const { name, position, phone, email, department } = req.body;

  if (!name || !position || !phone || !department) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: '手机号必须为 11 位数字', field: 'phone' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: '邮箱格式不正确', field: 'email' });
  }

  if (!DEPARTMENTS.includes(department)) {
    return res.status(400).json({ error: '部门无效' });
  }

  const newMember = db.addMember({ name, position, phone, email: email || '', department });
  res.status(201).json(newMember);
});

app.put('/api/members/:id', (req, res) => {
  const existing = db.getMemberById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: '成员不存在' });
  }

  const { name, position, phone, email, department } = req.body;

  if (!name || !position || !phone || !department) {
    return res.status(400).json({ error: '请填写所有必填项' });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({ error: '手机号必须为 11 位数字', field: 'phone' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: '邮箱格式不正确', field: 'email' });
  }

  if (!DEPARTMENTS.includes(department)) {
    return res.status(400).json({ error: '部门无效' });
  }

  const updated = db.updateMember(req.params.id, { name, position, phone, email: email || '', department });
  res.json(updated);
});

app.delete('/api/members/:id', (req, res) => {
  const result = db.deleteMember(req.params.id);
  if (!result) {
    return res.status(404).json({ error: '成员不存在' });
  }
  res.json({ message: '删除成功', willBeEmpty: result.willBeEmpty, department: result.department });
});

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
