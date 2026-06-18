const recordService = require('../services/recordService')

function list(req, res) {
  const { category, startDate, endDate } = req.query
  const records = recordService.getAll({ category, startDate, endDate })
  res.json(records)
}

function summary(req, res) {
  const { category, startDate, endDate } = req.query
  const result = recordService.getSummary({ category, startDate, endDate })
  const lastMonthBalance = recordService.getLastMonthBalance()
  res.json({ ...result, lastMonthBalance })
}

function create(req, res) {
  const { amount, category, date, note } = req.body
  if (amount === undefined || amount === null || Number(amount) === 0) {
    return res.status(400).json({ error: '金额不能为空或为0' })
  }
  const record = recordService.create({
    amount: Number(amount),
    category: category || '其他',
    date: date || new Date().toISOString().slice(0, 10),
    note: note || ''
  })
  res.status(201).json(record)
}

function update(req, res) {
  const { id } = req.params
  const { amount, category, date, note } = req.body
  if (amount !== undefined && Number(amount) === 0) {
    return res.status(400).json({ error: '金额不能为0' })
  }
  const existing = recordService.getById(id)
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' })
  }
  const record = recordService.update(id, {
    amount: amount !== undefined ? Number(amount) : existing.amount,
    category: category || existing.category,
    date: date || existing.date,
    note: note !== undefined ? note : existing.note
  })
  res.json(record)
}

function remove(req, res) {
  const { id } = req.params
  const existing = recordService.getById(id)
  if (!existing) {
    return res.status(404).json({ error: '记录不存在' })
  }
  recordService.remove(id)
  res.json({ success: true })
}

module.exports = {
  list,
  summary,
  create,
  update,
  remove
}
