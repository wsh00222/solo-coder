const { readAll, writeAll } = require('../models/recordModel')
const { v4: uuidv4 } = require('uuid')

function getAll({ category, startDate, endDate } = {}) {
  let records = readAll()
  if (category && category !== '全部') {
    records = records.filter(r => r.category === category)
  }
  if (startDate) {
    records = records.filter(r => r.date >= startDate)
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate)
  }
  records.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.id.localeCompare(a.id)
  })
  return records
}

function getById(id) {
  const records = readAll()
  return records.find(r => r.id === id) || null
}

function create(record) {
  const records = readAll()
  const now = new Date().toISOString()
  const newRecord = {
    id: uuidv4(),
    amount: record.amount,
    category: record.category || '其他',
    date: record.date,
    note: record.note || '',
    created_at: now,
    updated_at: now
  }
  records.push(newRecord)
  writeAll(records)
  return newRecord
}

function update(id, record) {
  const records = readAll()
  const idx = records.findIndex(r => r.id === id)
  if (idx === -1) return null
  records[idx] = {
    ...records[idx],
    amount: record.amount !== undefined ? record.amount : records[idx].amount,
    category: record.category || records[idx].category,
    date: record.date || records[idx].date,
    note: record.note !== undefined ? record.note : records[idx].note,
    updated_at: new Date().toISOString()
  }
  writeAll(records)
  return records[idx]
}

function remove(id) {
  const records = readAll()
  const filtered = records.filter(r => r.id !== id)
  if (filtered.length === records.length) return false
  writeAll(filtered)
  return true
}

function getSummary({ category, startDate, endDate } = {}) {
  let records = readAll()
  if (category && category !== '全部') {
    records = records.filter(r => r.category === category)
  }
  if (startDate) {
    records = records.filter(r => r.date >= startDate)
  }
  if (endDate) {
    records = records.filter(r => r.date <= endDate)
  }
  const totalIncome = records.reduce((s, r) => r.amount > 0 ? s + r.amount : s, 0)
  const totalExpense = records.reduce((s, r) => r.amount < 0 ? s + Math.abs(r.amount) : s, 0)
  const balance = records.reduce((s, r) => s + r.amount, 0)
  return { totalIncome, totalExpense, balance, count: records.length }
}

function getLastMonthBalance() {
  const records = readAll()
  const now = new Date()
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthStart = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`
  const lastMonthRecords = records.filter(r => r.date >= lastMonthStart && r.date < thisMonthStart)
  return lastMonthRecords.reduce((s, r) => s + r.amount, 0)
}

function count() {
  return readAll().length
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getSummary,
  getLastMonthBalance,
  count
}
